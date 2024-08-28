import { forwardRef, Module } from '@nestjs/common';
import { MailsModule } from 'src/shared/container/providers/MailProvider/mails.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PatientModule } from '../patient/patient.module';
import { PersonModule } from '../person/person.module';
import { PrescptionModule } from '../prescription/prescription.module';
import { AddressRepository } from './domain/repositories/address.repository';
import { OwnerAddressRepository } from './domain/repositories/owner.address.repository';
import { AddressController } from './infra/controller/address.controller';
import { AddressService } from './services/address.service';

@Module({
  imports: [
    forwardRef(() => MailsModule),
    PersonModule,
    PrescptionModule,
    PatientModule,
    DoctorModule,
  ],
  providers: [AddressRepository, OwnerAddressRepository, AddressService],
  controllers: [AddressController],
  exports: [AddressRepository, OwnerAddressRepository],
})
export class AddressModule {}
