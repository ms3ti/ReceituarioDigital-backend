import { ApiProperty } from '@nestjs/swagger';
import { IPrescriptionCompositionDto } from './prescription.composition.dto';
import { IDoctorDto } from '../../../doctor/contracts/dtos/doctor/doctor.dto';

export class IPrescriptionForEmergencyDto {
  id: number;
  active: boolean;
  createDate?: Date;
  updateDate?: Date;
  idPrescriptionType: number;
  assigned: boolean;
  patientId: number;
  doctorId: number;
  person: {
    name: string;
  };
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

export class IPrescriptionEmergencyForPrint {
  @ApiProperty()
  prescription: IPrescriptionForEmergencyDto;

  @ApiProperty()
  doctor: IDoctorDto;
}
