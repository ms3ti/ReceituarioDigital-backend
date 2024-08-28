import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { createHash, randomUUID } from 'crypto';
import { Response } from 'express';
import { readFile, rm, writeFile } from 'fs/promises';
import * as path from 'path';
import { DigitalSignatureProvider } from 'src/shared/container/providers/DigitalSignatureProvider/implementations/DigitalSignatureProvider';
import { plusOneDay } from 'src/shared/plusOneDay';
import { removeMask } from 'src/shared/removeMask';
import { SignResponse } from '../../../../shared/container/providers/DigitalSignatureProvider/dtos/IRequest.DTO';
import { MailService } from '../../../../shared/container/providers/MailProvider/implementations/MailService';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { OwnerAddressRepository } from '../../../address/domain/repositories/owner.address.repository';
import { ICreatePrescriptionDto } from '../../contracts/dtos/create.prescription.dto';
import { IMedicalExamDto } from '../../contracts/dtos/medical.exam.dto';
import { IMedicineDto } from '../../contracts/dtos/medicine.dto';
import {
  IPrescriptionFullInfoDto,
  IWhatsLink,
} from '../../contracts/dtos/prescription.full.info.dto';
import { IPrescriptionForPrint } from '../../contracts/dtos/prescription.print.dto';
import { IUpdatePrescriptionDto } from '../../contracts/dtos/update.prescrition.dto';
import { generatePDF } from '../../PrescriptionPDF';
import { PrescriptionService } from '../../services/prescription.service';
import { SNSService } from '../../services/sns.service';
import { ISignatureDto } from './../../contracts/dtos/signature.dto';
import { AuthGuard } from '@nestjs/passport';
import { IPrescriptionEmergencyForPrint } from '../../contracts/dtos/prescription.emergency.dto';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { generateEmergencyPDF } from '../../PrescriptionEmergencyPDF';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller('prescription')
@ApiTags('Prescription')
@UseGuards(AuthGuard('jwt'))
export class PrescriptionController {
  private readonly logger = new Logger();
  constructor(
    private prescritionService: PrescriptionService,
    private ownerAddressRepository: OwnerAddressRepository,
    private signatureSProvider: DigitalSignatureProvider,
    private emailService: MailService,
    private snsService: SNSService,
    private doctorService: DoctorService,
  ) {
    this.prescritionService = prescritionService;
  }

  @Patch('/sign/:prescriptionId')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async updateSignDocument(
    @Param('prescriptionId') prescriptionId: number,
    @Query('status') status: boolean,
    @Res() res: Response,
  ) {
    try {
      await this.prescritionService.updateBy(prescriptionId, {
        assigned: status,
      });

      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post signature error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Post('/sign/:prescriptionId')
  @ApiResponse({ type: SignResponse, status: HttpStatus.OK })
  async signDocument(
    @Param('prescriptionId') prescriptionId: number,
    @Query('status') status: boolean,
    @Res() res: Response,
  ) {
    try {
      const infoToPrint = await this.prescritionService.generateInfoToPrint(
        prescriptionId,
      );

      const pdfBase64 = await generatePDF(infoToPrint);

      const link = await this.prescritionService.saveFile(pdfBase64);

      await writeFile('temp.pdf', pdfBase64.buffer, 'base64');

      const tempFile = await readFile('temp.pdf');

      const hash = createHash('md5').update(tempFile).digest('hex');

      const signature = await this.signatureSProvider.publishDocument({
        DsDocumento: pdfBase64.fileName,
        DsDetalhesDocumento: pdfBase64.fileName,
        DtLimiteAssinatura: String(plusOneDay(new Date())),
        MD5Documento: hash,
        participantes: {
          CpfCnpj: removeMask.cpf(infoToPrint.doctor.cpf),
          DsNome: infoToPrint.doctor.name,
          DsEmail: infoToPrint.doctor.email,
          DsTelefoneContato: removeMask.ownerPhone(
            infoToPrint.doctor.phoneNumber,
          ),
        },
        pdfBase64: pdfBase64.buffer,
      });

      const signedDoc = await this.signatureSProvider.recoverDocument(
        signature.idDocument,
      );

      const linkSigned = await this.prescritionService.saveFile({
        buffer: signedDoc.docBase64,
        fileName: pdfBase64.fileName,
        prescriptionType: pdfBase64.prescriptionType,
      });

      await this.prescritionService.updateBy(infoToPrint.prescription.id, {
        link: linkSigned,
      });

      await this.prescritionService.signDocument(prescriptionId, true);

      await this.prescritionService.saveSignDocument(
        infoToPrint?.prescription.id,
        signature?.idDocument,
        signature?.url,
      );

      await rm('temp.pdf');

      await this.prescritionService.saveLink(prescriptionId, link);
      await this.prescritionService.updateDate(prescriptionId);

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass({ signature, link }, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post signature error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Post('/')
  @ApiResponse({ type: SignResponse, status: HttpStatus.OK })
  async createPrescription(
    @Res() res: Response,
    @Body() body: ICreatePrescriptionDto,
  ) {
    try {
      const result = await this.prescritionService.create(body);
      if (body.signed) {
        const infoToPrint = await this.prescritionService.generateInfoToPrint(
          result.id,
        );
        const pdfBase64 = await generatePDF(infoToPrint);
        const link = await this.prescritionService.saveFile(pdfBase64);
        await this.prescritionService.saveLink(result.id, link);
        result.link = link;
      }

      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post prescription error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/listExam')
  @ApiResponse({ type: [IMedicalExamDto], status: HttpStatus.OK })
  async listExams(@Res() res: Response, @Query('name') name: string) {
    try {
      const result = await this.prescritionService.listExams(name);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, {}).json());
    } catch (error) {
      console.log(error);
      this.logger.error(`Error on list exam: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/exam/:examId')
  @ApiResponse({ type: IMedicalExamDto, status: HttpStatus.OK })
  async getExamById(@Res() res: Response, @Param('examId') examId: number) {
    try {
      const result = await this.prescritionService.getExamByID(examId);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, {}).json());
    } catch (error) {
      console.log(error);
      this.logger.error(`Error on list exam: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/listMedicine')
  @ApiResponse({ type: [IMedicineDto], status: HttpStatus.OK })
  async listMedicine(@Res() res: Response, @Query('name') name: string) {
    try {
      const result = await this.prescritionService.listMedicine(name);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, {}).json());
    } catch (error) {
      console.log(error);
      this.logger.error(`Error on list medicine: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/medicine/:medicineId')
  @ApiResponse({ type: [IMedicineDto], status: HttpStatus.OK })
  async getMedicineById(
    @Res() res: Response,
    @Param('medicineId') medicineId: number,
  ) {
    try {
      const result = await this.prescritionService.getMedicineById(medicineId);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, {}).json());
    } catch (error) {
      console.log(error);
      this.logger.error(`Error on get medicine: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Put('/')
  @ApiResponse({ type: IWhatsLink, status: HttpStatus.OK })
  async updatePrescription(
    @Res() res: Response,
    @Body() body: IUpdatePrescriptionDto,
  ) {
    try {
      const prescriptionId = body.prescriptionId;
      await this.prescritionService.update(body);
      let whatsLink: string;
      if (body.assigned) {
        const infoToPrint = await this.prescritionService.generateInfoToPrint(
          prescriptionId,
        );
        const pdfBase64 = await generatePDF(infoToPrint);
        const link = await this.prescritionService.saveFile(pdfBase64);
        await this.prescritionService.saveLink(prescriptionId, link);
        whatsLink = link;
      }
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass({ whatsLink }, null));
    } catch (error) {
      console.log(error);
      this.logger.error('Error on update prescription');
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/:prescriptionId')
  @ApiResponse({ type: IPrescriptionFullInfoDto, status: HttpStatus.OK })
  async getPrescriptionById(
    @Param('prescriptionId') prescriptionId: number,
    @Res() res: Response,
  ) {
    try {
      const result = await this.prescritionService.getByPrescritionId(
        prescriptionId,
      );
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Get prescription by id error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/history/:doctorId/:total/:page')
  @ApiResponse({ type: [IPrescriptionFullInfoDto], status: HttpStatus.OK })
  async getPagiantionPrescription(
    @Param('doctorId') doctorId: number,
    @Query('patientName') patientName: string,
    @Query('animal') animal: string,
    @Param('total') total: number,
    @Param('page') page: number,
    @Query('searchType') searchType: 'Tutor' | 'Animal' | 'Ambos',
    @Res() res: Response,
  ) {
    try {
      const result = await this.prescritionService.getByPrescritionPagination(
        doctorId,
        patientName,
        total,
        page,
        animal,
        searchType,
      );
      return res
        .setHeader('total', result[0])
        .status(HttpStatus.OK)
        .send(new ResponseClass(result[1], null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Get pagination error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/:prescriptionId/generatePDF')
  @ApiResponse({ type: IPrescriptionForPrint, status: HttpStatus.OK })
  async generatePDF(
    @Res() res: Response,
    @Param('prescriptionId') prescriptionId: number,
  ) {
    try {
      const result = await this.prescritionService.generateInfoToPrint(
        prescriptionId,
      );
      const pdfBase64 = await generatePDF(result);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(pdfBase64, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`GeneratePDF Error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Post('/saveImage')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiResponse({ type: null, status: HttpStatus.OK })
  async saveImage(
    @Query('doctorId') doctorId: string,
    @Query('ownerAddressId') ownerAddressId: string,
    @Body() body: { data_url: string },
  ) {
    try {
      const fileName = `${randomUUID()}.jpg`;
      const filePath = `${doctorId}/${ownerAddressId}/${fileName}`;
      await this.prescritionService.uploadLogo(body.data_url, filePath);

      await this.ownerAddressRepository.setImageName(ownerAddressId, fileName);
    } catch (error) {
      console.error(error);
      this.logger.error(`Save image error: ${error}`);
    }
  }

  @Delete('/removeImage')
  @ApiResponse({ type: null, status: HttpStatus.OK })
  async removeImage(@Query('ownerAddressId') ownerAddressId: string) {
    try {
      await this.ownerAddressRepository.removeImage(ownerAddressId);
    } catch (error) {
      console.error(error);
      this.logger.error(`Remove image error: ${error}`);
    }
  }

  @Delete('/:prescriptionId')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async deletePrescription(
    @Res() res: Response,
    @Param('prescriptionId') prescriptionId: number,
  ) {
    try {
      await this.prescritionService.deletePrescription(prescriptionId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error(error);
      this.logger.error(`Delete prescription error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/:prescriptionId/sendDocument')
  @ApiResponse({ type: IWhatsLink, status: HttpStatus.OK })
  async saveFile(
    @Res() res: Response,
    @Query('email') email: string,
    @Query('phone') phoneNumber: string,
    @Query('whatsNumber') whatsNumber: string,
    @Param('prescriptionId') prescriptionId: number,
  ) {
    try {
      const result = await this.prescritionService.generateInfoToPrint(
        prescriptionId,
      );
      if (email) {
        const sharedDocTemplate = path.resolve(
          __dirname,
          '..',
          '..',
          '..',
          'views',
          'sharedDoc.hbs',
        );
        await this.emailService.sendMail({
          to: {
            name: result.prescription.person.name,
            email: email,
          },
          from: {
            name: 'MRD - Meu Receituário Digital',
            email: process.env.EMAIL_USER,
          },
          subject: 'Compartilhamento de documento',
          templateData: {
            file: sharedDocTemplate,
            variables: {
              link: result.prescription.link,
              doctorName: result.doctor.name,
            },
          },
        });
      }
      const message = `Dr(a). ${result.doctor.name} lhe enviou um documento digital: ${result.prescription.link}`;

      if (phoneNumber) {
        await this.snsService.sendSMS(phoneNumber, message);
      }

      let whatsLink: string;
      if (whatsNumber) {
        whatsLink = `https://wa.me/${whatsNumber}?text=${message.replaceAll(
          ' ',
          '%20',
        )}`;
      }
      return res
        .status(HttpStatus.OK)
        .send(
          new ResponseClass(
            { link: result.prescription.link, whatsLink },
            null,
          ).json(),
        );
    } catch (error) {
      console.error(error);
      this.logger.error(`Send document error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Post('/signature')
  @ApiResponse({ type: SignResponse, status: HttpStatus.CREATED })
  async signature(@Res() res: Response, @Body() body: ISignatureDto) {
    try {
      const result = await this.signatureSProvider.publishDocument(body);

      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post prescription error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/signature/recover/:idDocument')
  @ApiResponse({ type: SignResponse, status: HttpStatus.OK })
  async receoverDocument(
    @Res() res: Response,
    @Param('idDocument') idDocument: string,
  ) {
    try {
      const result = await this.signatureSProvider.recoverDocument(idDocument);

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post prescription error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/signature/check/:idDocument')
  @ApiResponse({ status: HttpStatus.CREATED })
  async checkDocument(
    @Res() res: Response,
    @Param('idDocument') idDocument: string,
  ) {
    try {
      const result = await this.signatureSProvider.checkDocument(idDocument);

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post prescription error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Post('/generateEmergencyFile/:doctorId')
  @ApiResponse({ type: IPrescriptionForPrint, status: HttpStatus.OK })
  async generateEmergencyFile(
    @Res() res: Response,
    @Body() body: IPrescriptionEmergencyForPrint,
    @Param('doctorId') doctorId: string,
  ) {
    try {
      const doctorInfo = await this.doctorService.getDoctorById(
        Number(doctorId),
      );
      body.doctor = doctorInfo;
      for (const pc of body.prescription.prescriptionCompositons) {
        if (pc.examId) {
          pc.exam = await this.prescritionService.getExamByID(pc.examId);
        }
        if (pc.medicineId) {
          pc.medicineDto = await this.prescritionService.getMedicineById(
            pc.medicineId,
          );
        }
      }
      const result = await generateEmergencyPDF(body);

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      this.logger.error(`Post generate emergencyFile error: ${error}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
