import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ResponseClass } from '../../../../shared/ResponseBody';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { PersonService } from '../../../person/services/person.service';
import { ILoginDto } from '../../contracts/dtos/Ilogin.dto';
import { IChangePassword } from '../../contracts/dtos/IChangePassword.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICognitoDto } from '../../contracts/dtos/login.dto';
import { IAuthenticateUserDTO } from '../../contracts/dtos/IAuthenticateUserDTO';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly doctorService: DoctorService,
    private readonly personService: PersonService,
  ) {}

  @Post('login')
  @ApiResponse({ type: ICognitoDto, status: HttpStatus.OK })
  async login(@Body() authenticateRequest: ILoginDto, @Res() res: Response) {
    try {
      const { email, password }: IAuthenticateUserDTO = authenticateRequest;

      const result = await this.authService.login({
        email,
        password,
      });
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

  @Post('changePassword')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ description: 'No content', status: HttpStatus.NO_CONTENT })
  async changePassword(@Body() body: IChangePassword, @Res() res: Response) {
    try {
      const { email, oldPassword, newPassword } = body;
      await this.authService.changePassword(email, oldPassword, newPassword);

      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass({}, null).json());
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('approve/:idPerson/:active')
  @ApiResponse({
    description: 'OK',
    status: HttpStatus.OK,
    type: 'Ação realizada com sucesso!',
  })
  async approveProfessional(
    @Param('idPerson') idPerson: number,
    @Param('active') active: string,
    @Res() res: Response,
  ) {
    try {
      await this.authService.getDoctorAndUpateActiveByPersonId(
        idPerson,
        active,
      );

      return res
        .status(HttpStatus.OK)
        .send(new ResponseClass('Ação realizada com sucesso!', null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }

  @Get('recovery/:email')
  @ApiResponse({ description: 'No content', status: HttpStatus.NO_CONTENT })
  async recoverPassword(@Param('email') email: string, @Res() res: Response) {
    try {
      await this.authService.recoveryPassword(email);

      return res
        .status(HttpStatus.NO_CONTENT)
        .send(new ResponseClass('Ação realizada com sucesso!', null).json());
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(new ResponseClass(null, error).json());
    }
  }
}
