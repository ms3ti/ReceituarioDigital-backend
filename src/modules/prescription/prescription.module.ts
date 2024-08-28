import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { DigitalSignatureProvider } from '../../shared/container/providers/DigitalSignatureProvider/implementations/DigitalSignatureProvider';
import { SignatureModule } from '../../shared/container/providers/DigitalSignatureProvider/signature.module';
import { MailService } from '../../shared/container/providers/MailProvider/implementations/MailService';
import { AddressModule } from '../address/address.module';
import { DoctorModule } from '../doctor/doctor.module';
import { PatientModule } from '../patient/patient.module';
import { PersonModule } from '../person/person.module';
import { PrescriptionController } from './infra/controller/prescription.controller';
import { MedicalExcamRepository } from './infra/domain/repositories/medical.exam.repository';
import { MedicineRepository } from './infra/domain/repositories/medicine.repository';
import { PrescriptionRepository } from './infra/domain/repositories/prescription.repository';
import { PrescriptionCompositionRepository } from './infra/domain/repositories/prescriptionComposition.repository';
import { PrescriptionService } from './services/prescription.service';
import { S3Service } from './services/s3.service';
import { SNSService } from './services/sns.service';

@Module({
  imports: [
    SignatureModule,
    HttpModule,
    forwardRef(() => PersonModule),
    forwardRef(() => PatientModule),
    forwardRef(() => DoctorModule),
    forwardRef(() => AddressModule),
  ],
  providers: [
    PrescriptionRepository,
    PrescriptionCompositionRepository,
    PrescriptionService,
    MedicalExcamRepository,
    MedicineRepository,
    S3Service,
    MailService,
    SNSService,
    DigitalSignatureProvider,
  ],
  controllers: [PrescriptionController],
  exports: [PrescriptionService, PrescriptionRepository],
})
export class PrescptionModule {}
