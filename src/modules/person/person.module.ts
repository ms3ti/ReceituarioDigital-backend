import { forwardRef, Module } from '@nestjs/common';
import { MailsModule } from 'src/shared/container/providers/MailProvider/mails.module';
import { AddressModule } from '../address/address.module';
import { AuthModule } from '../auth/auth.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PatientModule } from '../patient/patient.module';
import { PrescptionModule } from '../prescription/prescription.module';
import { PersonController } from './infra/controller/person.controller';
import { PersonRepository } from './infra/domain/repositories/person.repository';
import { PersonService } from './services/person.service';
import { BCryptHashProvider } from 'src/modules/auth/providers/HashProvider/implementations/BCryptHashProvider';

@Module({
  imports: [
    forwardRef(() => PatientModule),
    MailsModule,
    forwardRef(() => AuthModule),
    PrescptionModule,
    forwardRef(() => AddressModule),
    forwardRef(() => DoctorModule),
  ],
  providers: [PersonRepository, PersonService, BCryptHashProvider],
  controllers: [PersonController],
  exports: [PersonRepository, PersonService],
})
export class PersonModule {}
