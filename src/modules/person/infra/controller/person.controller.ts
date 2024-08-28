import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ICreateDoctorDto } from 'src/modules/doctor/contracts/dtos/doctor/create.doctor.dto';
import { ICreatePatientDto } from 'src/modules/patient/contracts/dtos/patient/create.patient.dto';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { AuthService } from '../../../auth/services/auth.service';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { PatientService } from '../../../patient/services/patient.service';
import { ICreateAdminDto } from '../../contracts/dtos/person/create.admin.dto';
import { IUpdateAdminDto } from '../../contracts/dtos/person/update.admin.dto';
import { PersonService } from '../../services/person.service';
import { addDays } from 'date-fns';
import { PlanType } from 'src/shared/enum/planType';
import { Person } from '../domain/entities/person.entity';
import { IPersonFullInfoDto } from '../../contracts/dtos/person/personFullInfo.dto';
import * as bcrypt from 'bcrypt';

@Controller('person')
@ApiTags('Person')
export class PersonController {
  private readonly logger = new Logger();
  constructor(
    public readonly personService: PersonService,
    public readonly doctorService: DoctorService,
    public readonly patientService: PatientService,
    public readonly authService: AuthService,
  ) {}

  @Get('/admin')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: [Person], status: HttpStatus.OK })
  async getAdminByCPFName(
    @Query('nameOrCpf') nameOrCpf: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.personService.getAdminByCPFOrName(nameOrCpf);
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

  @Get('/:cpf')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: [Person], status: HttpStatus.OK })
  async getByCPF(@Param('cpf') cpf, @Res() res: Response) {
    try {
      const result = await this.personService.findBy('cpf', cpf);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/find/:id')
  @ApiResponse({ type: [Person], status: HttpStatus.OK })
  async getPersonById(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.personService.findBy('id', id);

      delete result[0].id;
      delete result[0].name;
      delete result[0].email;
      delete result[0].cpf;
      delete result[0].birthDate;
      delete result[0].mothersName;
      delete result[0].phoneNumber;
      delete result[0].sex;
      delete result[0].personType;
      delete result[0].socialName;
      delete result[0].createDate;
      delete result[0].updateDate;

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

  @Post('/doctor/')
  @ApiResponse({ type: Person, status: HttpStatus.CREATED })
  async createDoctor(@Body() body: ICreateDoctorDto, @Res() res: Response) {
    try {
      const result = await this.doctorService.createDoctor(body);
      delete result.password;
      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      if (error instanceof HttpException) {
        return res
          .status(HttpStatus.CONFLICT)
          .send(new ResponseClass(null, error).json());
      } else {
        return res.status(500).send(new ResponseClass(null, error).json());
      }
    }
  }

  @Get('/checkAdmin/:cpf')
  @ApiResponse({ type: Person, status: HttpStatus.CREATED })
  async checkAdmin(@Res() res: Response, @Param('cpf') cpf: string) {
    try {
      const result = await this.personService.getInfoForAdmin(cpf);
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);

      return res.status(500).send(new ResponseClass(null, error).json());
    }
  }

  @Post('/patient/')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: Person, status: HttpStatus.CREATED })
  async createPatient(@Body() body: ICreatePatientDto, @Res() res: Response) {
    try {
      const result = await this.patientService.createPatient(body);

      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      if (error instanceof HttpException) {
        return res
          .status(HttpStatus.CONFLICT)
          .send(new ResponseClass(null, error).json());
      } else {
        return res.status(500).send(new ResponseClass(null, error).json());
      }
    }
  }

  @Post('/admin/')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: Person, status: HttpStatus.CREATED })
  async createAdmin(@Body() body: ICreateAdminDto, @Res() res: Response) {
    try {
      const salt = await bcrypt.genSalt();
      body.password = await bcrypt.hash(body.password, salt);

      const alreadyExistAdmin = await this.personService.findBy(
        'cpf',
        body.cpf,
      );
      const person = await this.personService.getUserNameByEmail(body.email);

      if (Boolean(person)) {
        throw new ConflictException(
          'Já existe um Administrador com este email',
        );
      }

      const result = await this.personService.create(body);
      return res
        .status(HttpStatus.CREATED)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      if (error instanceof HttpException) {
        return res
          .status(HttpStatus.CONFLICT)
          .send(new ResponseClass(null, error).json());
      } else {
        return res.status(500).send(new ResponseClass(null, error).json());
      }
    }
  }

  @Put('/admin/:idAdmin')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async updateAdmin(
    @Param('idAdmin') idAdmin: number,
    @Body() body: IUpdateAdminDto,
    @Res() res: Response,
  ) {
    try {
      await this.personService.updateAdmin(idAdmin, body);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);

      return res.status(500).send(new ResponseClass(null, error).json());
    }
  }

  @Get('/admin/:idAdmin')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: Person, status: HttpStatus.OK })
  async getAdminById(@Param('idAdmin') idAdmin: number, @Res() res: Response) {
    try {
      const [result] = await this.personService.findAdminBy(
        'id',
        String(idAdmin),
      );
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);

      return res.status(500).send(new ResponseClass(null, error).json());
    }
  }

  @Get('login/:email')
  @ApiResponse({ type: IPersonFullInfoDto, status: HttpStatus.OK })
  async getPersonByEmail(@Param('email') email: string, @Res() res: Response) {
    try {
      const result = await this.personService.getPersonEmail(email);
      const [doctor] = await this.doctorService.getDoctorByPersonId(result.id);

      return res.status(HttpStatus.OK).send(
        new ResponseClass(
          {
            ...result,
            ...doctor,
            doctorId: doctor?.id,
            personId: result?.id,
          },
          null,
        ).json(),
      );
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Delete('/admin/:idAdmin')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async deleteAdmin(@Param('idAdmin') idAdmin: number, @Res() res: Response) {
    try {
      await this.personService.findAdminBy('id', String(idAdmin));
      await this.personService.deleteAdminById(idAdmin);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.log(error);
      this.logger.error(error);

      return res.status(500).send(new ResponseClass(null, error).json());
    }
  }

  @Get('patient/:idDoctor/:nameOrCpf')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    type: Person,
    status: HttpStatus.OK,
  })
  async getByCPFName(
    @Param('idDoctor') idDoctor: number,
    @Param('nameOrCpf') nameOrCpf: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.patientService.getPatientByCPF(
        idDoctor,
        nameOrCpf,
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

  @Delete('/:personId')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async delete(@Param('personId') personId: number, @Res() res: Response) {
    try {
      await this.personService.deleteById(personId);
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Patch('/:personId/enable')
  @ApiResponse({ type: null, status: HttpStatus.NO_CONTENT })
  async updateStatusAccount(
    @Param('personId') personId: number,
    @Res() res: Response,
  ) {
    try {
      const [person] = await this.personService.findBy('id', String(personId));
      if (person.active) {
        await this.personService.disablePerson(personId);
        const doctor = await this.doctorService.getDoctorByPersonId(personId);

        await this.doctorService.updateTrail(doctor[0].id, {
          date_plan: new Date(),
        });
        await this.doctorService.updatePlan(doctor[0].id, {
          plan: PlanType.BLOCKED,
        });
      } else {
        await this.personService.enablePerson(personId);
        const doctor = await this.doctorService.getDoctorByPersonId(personId);

        await this.doctorService.updateTrail(doctor[0].id, {
          date_plan: addDays(new Date(), 8),
        });
        await this.doctorService.updatePlan(doctor[0].id, {
          plan: PlanType.PLAN_1,
        });
      }
      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass(null, null).json());
    } catch (error) {
      console.log(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('/list/:value')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ type: IPersonFullInfoDto, status: HttpStatus.OK })
  async listByCPF(@Param('value') value: string, @Res() res: Response) {
    try {
      let result: any[];
      if (value !== 'none') {
        result = await this.personService.searchDoctorByCPFOrName(value);
      } else {
        result = await this.personService.latestDoctors();
      }
      for (const doctor of result) {
        const [doctorResult] = await this.doctorService.getDoctorByPersonId(
          doctor.id,
        );
        doctor.doctor = doctorResult;
      }
      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass(result, null).json());
    } catch (error) {
      this.logger.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
