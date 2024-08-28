import {
  Injectable,
  HttpStatus,
  NotAcceptableException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { resolve } from 'path';
import { MailService } from '../../../shared/container/providers/MailProvider/implementations/MailService';
import { PersonRepository } from '../../person/infra/domain/repositories/person.repository';
import { PersonService } from '../../person/services/person.service';

import { IResponseTokenDTO } from '../contracts/dtos/IResponseTokenDTO';
import { IAuthenticateUserDTO } from '../contracts/dtos/IAuthenticateUserDTO';
import { NestJWTTokenProvider } from '../providers/TokenProvider/implementations/NestJWTTokenProvider';
import * as bcrypt from 'bcrypt';
import { generatePassword } from '../../../shared/generatePassword';
import * as dotenv from 'dotenv';
import { DoctorRepository } from 'src/modules/doctor/infra/domain/repositories/doctor.repository';
import { addDays } from 'date-fns';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private readonly personService: PersonService,
    private readonly mailerService: MailService,
    private readonly personRepository: PersonRepository,
    private readonly doctorRepository: DoctorRepository,
    private readonly tokenProvider: NestJWTTokenProvider,
  ) {}

  async login({
    email,
    password,
  }: IAuthenticateUserDTO): Promise<IResponseTokenDTO> {
    const [user] = await this.personService.findAdminOrDoctorBy('email', email);
    if (!user) {
      throw new UnauthorizedException({
        title: 'Falha ao entrar!',
        message: 'Usuário não encontrado!',
        data: null,
        cod: 'unauthorized',
      });
    }
    const passwordMatched = bcrypt.compareSync(password, user.password);

    if (!user.active) {
      throw new UnauthorizedException({
        title: 'Falha ao entrar!',
        message: 'Conta não ativada!',
        data: null,
        cod: 'unauthorized',
      });
    }

    if (!passwordMatched) {
      throw new UnauthorizedException({
        title: 'Falha ao entrar!',
        message: 'Combinação email/senha incorreta!',
        data: null,
        cod: 'unauthorized',
      });
    }

    const token = await this.tokenProvider.generateToken(user.id.toString());

    return {
      idToken: { jwtToken: token },
    };
  }

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const [user] = await this.personService.findBy('email', email);
      const passwordMatched = await bcrypt.compare(oldPassword, user.password);

      if (passwordMatched) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await this.personRepository.updateBy(user.id, {
          password: passwordHash,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async getDoctorAndUpateActiveByPersonId(id: number, active: string) {
    const result = await this.personRepository.findBy('id', String(id));
    const doctor = await this.doctorRepository.findBy('idPerson', String(id));
    const newDate = addDays(new Date(), 8);

    switch (active) {
      case 'approved':
        const templateApproved = resolve(
          __dirname,
          '..',
          '..',
          'views',
          'approved.hbs',
        );
        const active = { active: true };
        const approve = { approve: true };

        if (!result[0]?.active) {
          await this.mailerService.sendMail({
            to: {
              name: result[0]?.name,
              email: result[0]?.email,
            },
            from: {
              name: 'MRD - Meu Receituário Digital',
              email: process.env.EMAIL_USER,
            },
            subject: 'MRD - Temos uma boa notícia! :D',
            templateData: {
              file: templateApproved,
              variables: {},
            },
          });

          await this.doctorRepository.updateDatePlan(doctor[0].id, {
            date_plan: newDate,
          });
          await this.personRepository.updateActivedDoctor(String(id), active);
          await this.personRepository.updateActivedDoctor(String(id), approve);
        } else {
          throw new NotAcceptableException({
            title: 'Ação não permitida!',
            message: HttpStatus.NOT_ACCEPTABLE,
          });
        }

        break;
      case 'rejected':
        const templateRejected = resolve(
          __dirname,
          '..',
          '..',
          'views',
          'rejected.hbs',
        );

        if (result[0]?.active) {
          throw new NotAcceptableException({
            title: 'Ação não permitida!',
            message: HttpStatus.NOT_ACCEPTABLE,
          });
        } else {
          await this.mailerService.sendMail({
            to: {
              name: result[0]?.name,
              email: result[0]?.email,
            },

            from: {
              name: 'MRD - Meu Receituário Digital',
              email: process.env.EMAIL_USER,
            },
            subject: 'MRD - Não gosto de dar más notícias! :( ',
            templateData: {
              file: templateRejected,
              variables: {},
            },
          });

          await this.personService.deleteById(id);
        }

        break;
      default:
        throw new NotAcceptableException({
          title: 'Ação não permitida!',
          message: HttpStatus.NOT_ACCEPTABLE,
        });
    }
  }

  async recoveryPassword(email: string) {
    const person = await this.personService.getPersonEmail(email);
    if (!person) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const newPasswordPlainText = generatePassword();
    await this.personService.updatePassword(person.id, newPasswordPlainText);
    const recoveryPassword = resolve(
      __dirname,
      '..',
      '..',
      'views',
      'recoveryPassword.hbs',
    );
    await this.mailerService.sendMail({
      to: {
        name: person.name,
        email: email,
      },
      subject: 'Recuperação de senha',
      templateData: {
        file: recoveryPassword,
        variables: {
          newPassword: newPasswordPlainText,
          doctorName: person.name,
        },
      },
      from: {
        name: 'MRD - Meu Receituário Digital',
        email: process.env.EMAIL_USER,
      },
    });
  }
}
