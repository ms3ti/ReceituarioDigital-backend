import { forwardRef, Module } from '@nestjs/common';
import { AddressModule } from '../address/address.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PersonModule } from '../person/person.module';
import { PatientController } from './infra/controller/patient.controller';
import { PatientRepository } from './infra/domain/repositories/patient.repository';
import { PatientService } from './services/patient.service';
@Module({
  imports: [
    forwardRef(() => DoctorModule),
    forwardRef(() => PersonModule),
    forwardRef(() => AddressModule),
  ],
  providers: [PatientRepository, PatientService],
  controllers: [PatientController],
  exports: [PatientRepository, PatientService],
})
export class PatientModule {}
