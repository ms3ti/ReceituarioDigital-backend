import { forwardRef, Module } from '@nestjs/common';
import { MailsModule } from 'src/shared/container/providers/MailProvider/mails.module';
import { AddressModule } from '../address/address.module';
import { AuthModule } from '../auth/auth.module';
import { PatientModule } from '../patient/patient.module';
import { PersonModule } from '../person/person.module';
import { PrescptionModule } from '../prescription/prescription.module';
import { DoctorController } from './infra/controller/doctor.controller';
import { DoctorRepository } from './infra/domain/repositories/doctor.repository';
import { DoctorSpecialtyRepository } from './infra/domain/repositories/doctor.specialties.repository';
import { DoctorService } from './services/doctor.service';

@Module({
  imports: [
    MailsModule,
    PersonModule,
    forwardRef(() => AddressModule),
    PatientModule,
    PrescptionModule,
    forwardRef(() => AuthModule),
  ],
  providers: [DoctorRepository, DoctorSpecialtyRepository, DoctorService],
  controllers: [DoctorController],
  exports: [DoctorRepository, DoctorSpecialtyRepository, DoctorService],
})
export class DoctorModule {}
