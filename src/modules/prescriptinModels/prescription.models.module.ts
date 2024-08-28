import { Module } from '@nestjs/common';
import { PrescriptionModelController } from './infra/controller/prescription.models.controller';
import { PrescriptionCompositionModelRepository } from './infra/domain/repositories/prescription.composition.model.repository';
import { PrescriptionModelRepository } from './infra/domain/repositories/prescription.model.repository';
import { PrescriptionModelService } from './services/prescription.models.service';

@Module({
  imports: [],
  providers: [
    PrescriptionModelService,
    PrescriptionModelRepository,
    PrescriptionCompositionModelRepository,
  ],
  controllers: [PrescriptionModelController],
})
export class PrescptionModelsModule {}
