import { IUpdatePrescriptionCompositionModelDto } from './update.prescription.composition.model.dto';

export class IUpdatePrescriptionModelDto {
  date: string;
  hour: string;
  active: boolean;
  createDate: string;
  doctorId: number;
  documentTypeId: number;
  id: number;
  idPrescriptionType: number;
  title: string;
  updateDate: string;
  prescriptionCompositonsModels: IUpdatePrescriptionCompositionModelDto[];
}
