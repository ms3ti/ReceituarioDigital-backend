import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AddressModule } from './modules/address/address.module';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { Doctor } from './modules/doctor/infra/domain/entities/doctor.entity';
import { DoctorSpecialties } from './modules/doctor/infra/domain/entities/doctor.specialties';
import { HealthModule } from './modules/health/health.module';
import { Patient } from './modules/patient/infra/domain/entities/patient.entity';
import { PatientModule } from './modules/patient/patient.module';
import { Address } from './modules/person/infra/domain/entities/address.entity';
import { OwnerAddress } from './modules/person/infra/domain/entities/owner.address.entity';
import { Person } from './modules/person/infra/domain/entities/person.entity';
import { PersonModule } from './modules/person/person.module';
import { PrescriptionCompositionModel } from './modules/prescriptinModels/infra/domain/entities/prescriptionComposition.entity';
import { PrescriptionModel } from './modules/prescriptinModels/infra/domain/entities/prescriptionModel.entity';
import { PrescptionModelsModule } from './modules/prescriptinModels/prescription.models.module';
import { MedicalExam } from './modules/prescription/infra/domain/entities/medicalExam.entity';
import { Medicine } from './modules/prescription/infra/domain/entities/medicine.entity';
import { Prescription } from './modules/prescription/infra/domain/entities/prescription.entity';
import { PrescriptionComposition } from './modules/prescription/infra/domain/entities/prescriptionComposition.entity';
import { PrescriptionType } from './modules/prescription/infra/domain/entities/prescriptionType.entity';
import { PrescptionModule } from './modules/prescription/prescription.module';
import { Term } from './modules/terms/infra/domain/entities/term.entity';
import { TermModule } from './modules/terms/term.module';
import { MailsModule } from './shared/container/providers/MailProvider/mails.module';
import { BaseEntity } from './shared/infra/entities/base.entity';

import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: Number(process.env.DB_PORT),
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        BaseEntity,
        Person,
        Address,
        OwnerAddress,
        Doctor,
        DoctorSpecialties,
        Patient,
        Medicine,
        Prescription,
        PrescriptionComposition,
        PrescriptionType,
        Term,
        PrescriptionModel,
        PrescriptionCompositionModel,
        MedicalExam,
      ],
      migrations: ['./src/shared/infra/typeorm/migrations/*.{ts,js}'],
      synchronize: true,
      logging: ['error', 'warn', 'log', 'info', 'schema', 'migration'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrescptionModule,
    PatientModule,
    HealthModule,
    TermModule,
    AddressModule,
    PrescptionModelsModule,
    MailsModule,
    DoctorModule,
    PersonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
