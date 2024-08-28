import { IPersonDto } from '../../../person/contracts/dtos/person/person.dto';
import { IPrescriptionCompositionDto } from './prescription.composition.dto';

export class IPrescriptionDto {
  id: number;
  active: boolean;
  createDate?: Date;
  updateDate?: Date;
  idPrescriptionType: number;
  assigned: boolean;
  patientId: number;
  doctorId: number;
  person: IPersonDto;
  prescriptionCompositons: IPrescriptionCompositionDto[];
  documentTypeId: number;
  date?: string;
  hour?: string;
  ownerAddressId?: number;
  link: string;
  linkSigned: string;
  idDocument: string;
  shouldShowDate: boolean;
}
