import { PrescriptionComposition } from '../../infra/domain/entities/prescriptionComposition.entity';
import { ICreatePrescriptionCompositionDto } from '../dtos/create.prescription.composition.dto';

export interface IPrescriptionCompositionRepository {
  create(
    prescriptionComposition: ICreatePrescriptionCompositionDto,
    prescriptionId: number,
  ): Promise<PrescriptionComposition>;
}
