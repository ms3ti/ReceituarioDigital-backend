import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  Logger,
  UseGuards,
  Get,
  Query,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { JwtAuthenticationGuard } from '../../../auth/jwt.guard';
import { ICreatePrescriptionModelDto } from '../../contracts/dtos/create.prescription.model.dto';
import { IPrescriptionModelDto } from '../../contracts/dtos/prescription.model.dto';
import { IUpdatePrescriptionModelDto } from '../../contracts/dtos/update.prescription.model.dto';
import { PrescriptionModelService } from '../../services/prescription.models.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('prescriptionModel')
@ApiTags('prescriptionModel')
@UseGuards(AuthGuard('jwt'))
export class PrescriptionModelController {
  private readonly logger = new Logger();
  constructor(
    private readonly prescriptionModelService: PrescriptionModelService,
  ) {}

  @Post('/')
  @ApiResponse({ type: IPrescriptionModelDto, status: HttpStatus.CREATED })
  async createPrescription(
    @Res() res: Response,
    @Body() body: ICreatePrescriptionModelDto,
  ) {
    try {
      const result = await this.prescriptionModelService.create(body);

      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error('Error on create new model:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/doctor/:doctorId')
  @ApiResponse({ type: [IPrescriptionModelDto], status: HttpStatus.OK })
  async listPrescritionModel(
    @Res() res: Response,
    @Query('prescriptionTitle') prescriptionTitle: string,
    @Query('documentTypeId') documentTypeId: number,
    @Param('doctorId') doctorId: number,
  ) {
    try {
      const result = await this.prescriptionModelService.list(
        documentTypeId,
        prescriptionTitle,
        doctorId,
      );

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error('Error on search model:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Delete('/:prescriptionId')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async deletePrescritionModel(
    @Param('prescriptionId') prescriptionId: number,
    @Res() res: Response,
  ) {
    try {
      await this.prescriptionModelService.deletePrescriptionModel(
        prescriptionId,
      );
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null));
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error));
    }
  }

  @Get('/:prescriptionModelId')
  @ApiResponse({ type: IPrescriptionModelDto, status: HttpStatus.OK })
  async getPrescriptionModelById(
    @Res() res: Response,
    @Param('prescriptionModelId') prescriptionModelId: number,
  ) {
    try {
      const result = await this.prescriptionModelService.getById(
        prescriptionModelId,
      );

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error('Error on search model:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Put('/')
  @UseGuards(JwtAuthenticationGuard)
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async updatePrescription(
    @Res() res: Response,
    @Body() body: IUpdatePrescriptionModelDto,
  ) {
    try {
      await this.prescriptionModelService.update(body);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.log(error);
      this.logger.error('Error on update prescription model');
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
