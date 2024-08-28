import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailsModule } from '../../shared/container/providers/MailProvider/mails.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PersonModule } from '../person/person.module';
import { PrescptionModule } from '../prescription/prescription.module';
import { AuthController } from './infra/controller/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './services/auth.service';
import { jwtConstants } from '../../shared/infra/http/middlewares/constants';

import { BCryptHashProvider } from './providers/HashProvider/implementations/BCryptHashProvider';
import { NestJWTTokenProvider } from './providers/TokenProvider/implementations/NestJWTTokenProvider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    forwardRef(() => DoctorModule),
    forwardRef(() => PersonModule),

    MailsModule,
    PrescptionModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    BCryptHashProvider,
    NestJWTTokenProvider,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    BCryptHashProvider,
    NestJWTTokenProvider,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
