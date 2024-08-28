import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { PersonService } from '../../../person/services/person.service';
import { IUpdateDoctorDto } from '../../contracts/dtos/doctor/update.doctor.dto';
import { DoctorService } from '../../services/doctor.service';
import { PlanType } from 'src/shared/enum/planType';
import { AuthService } from '../../../auth/services/auth.service';
import { emailToUserName } from '../../../../shared/emailToUserName';
import { IDoctorDto } from '../../contracts/dtos/doctor/doctor.dto';

@Controller('doctor')
@ApiTags('Doctor')
@UseGuards(AuthGuard('jwt'))
export class DoctorController {
  constructor(
    public readonly personService: PersonService,
    public readonly doctorService: DoctorService,
    public readonly authService: AuthService,
  ) {}
  @Get('/:id')
  @ApiResponse({
    type: IDoctorDto,
    status: HttpStatus.OK,
  })
  async getDoctorById(@Param('id') id: number, @Res() res: Response) {
    try {
      const result = await this.doctorService.getDoctorById(id);
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
  @ApiResponse({
    description: 'No content',
    status: HttpStatus.NO_CONTENT,
  })
  async updateDoctor(@Res() res: Response, @Body() body: IUpdateDoctorDto) {
    try {
      await this.personService.updateDoctor(body);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Put('/:id/plan')
  @ApiResponse({
    description: 'No content',
    status: HttpStatus.NO_CONTENT,
  })
  async updatePlan(@Res() res: Response, @Param('id') id: string) {
    try {
      await this.doctorService.updatePlan(Number(id), {
        plan: PlanType.PLAN_1,
      });
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('login/:email')
  @ApiResponse({
    type: IDoctorDto,
    status: HttpStatus.OK,
  })
  async getDoctorByEmail(@Param('email') email: string, @Res() res: Response) {
    try {
      const result = await this.doctorService.getDoctorByEmail(email);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Delete('/:personId')
  @ApiResponse({
    description: 'No content',
    status: HttpStatus.NO_CONTENT,
  })
  async deleteDoctor(
    @Param('personId') personId: string,
    @Res() res: Response,
  ) {
    try {
      const [person] = await this.personService.findBy('id', personId);
      if (!person.username) {
        person.username = emailToUserName(person.email);
      }

      await this.personService.deleteById(Number(personId));
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
