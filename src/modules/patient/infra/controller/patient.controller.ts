import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { Response } from 'express';
import { PatientService } from '../../services/patient.service';
import { IUpdatePatientById } from '../../contracts/dtos/patient/update.patient.dto';
import { PersonService } from '../../../person/services/person.service';
import { AuthGuard } from '@nestjs/passport';
import { IPatchPatientDto } from '../../contracts/dtos/patient/patch.patient.dto';
import { IListPatientDto } from '../../contracts/dtos/patient/list.patient.dto';
import { IGetPatientByIdDto } from '../../contracts/dtos/patient/get.patient.dto';
@Controller('patient')
@ApiTags('Patient')
@UseGuards(AuthGuard('jwt'))
export class PatientController {
  constructor(
    public patientService: PatientService,
    public personService: PersonService,
  ) {}

  @Get('/doctor/:idDoctor')
  @ApiResponse({ type: [IListPatientDto], status: HttpStatus.OK })
  async list(
    @Param('idDoctor') idDoctor: string,
    @Res() res: Response,
    @Query('query') query: string,
  ) {
    try {
      const result = await this.patientService.listByDoctor(
        Number(idDoctor),
        query,
      );
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('cpf/:cpf')
  @ApiResponse({ type: IGetPatientByIdDto, status: HttpStatus.OK })
  async getPatientBycpf(
    @Param('cpf') cpf: string,
    @Query('doctorId') doctorId: number,
    @Res() res: Response,
  ) {
    const result = await this.patientService.findPatientByCPF(cpf, doctorId);

    return res
      .status(HttpStatus.OK)
      .send(new ResponseClass(result, null).json());
  }

  @Get('/:id')
  @ApiResponse({ type: IGetPatientByIdDto, status: HttpStatus.OK })
  async getPatientById(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.patientService.getPatientById(id);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Put('/')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async updatePatientById(
    @Res() res: Response,
    @Body() body: IUpdatePatientById,
  ) {
    try {
      await this.personService.updatePatient(body);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Patch('/:patientId')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async patchPatient(
    @Body() body: IPatchPatientDto,
    @Param('patientId') patientId: string,
    @Res() res: Response,
  ) {
    if (body.cpf) {
      const result = await this.patientService.verifyCPFExistsInThisDoctor(
        body.cpf,
        body.doctorId,
      );

      if (result) {
        throw new ConflictException({
          title: 'Você já cadastrou esse CPF',
          message: HttpStatus.CONFLICT,
        });
      }
    }
    await this.personService.patchPerson(body, patientId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Delete('/:patientId')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async deletePatient(
    @Param('patientId') patientId: string,
    @Res() res: Response,
  ) {
    try {
      await this.patientService.disablePatient(patientId);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
