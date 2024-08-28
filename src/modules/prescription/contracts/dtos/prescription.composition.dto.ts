import { IMedicalExamDto } from './medical.exam.dto';
import { IMedicineDto } from './medicine.dto';

export class IPrescriptionCompositionDto {
  id: number;
  active: boolean;
  createDate?: Date;
  updateDate?: Date;
  prescriptionId: number;
  description: string;
  medicine: string | null;
  activePrinciple: string | null;
  dosage: string | null;
  packing: string | null;
  isOrientation: boolean;
  isContent: boolean;
  isTitle: boolean;
  isJustification: boolean;
  examId: number;
  medicineId: number;
  exam?: IMedicalExamDto;
  medicineDto?: IMedicineDto;
  quantity: number;
}
