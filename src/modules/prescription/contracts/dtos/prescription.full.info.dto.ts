import { ApiProperty } from '@nestjs/swagger';
import { IMedicalExamDto } from './medical.exam.dto';

class PrescriptionComposition {
  @ApiProperty()
  prescriptionId: number;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  medicine: string;

  @ApiProperty({ nullable: true })
  activePrinciple: string;

  @ApiProperty({ nullable: true })
  dosage: string;

  @ApiProperty({ nullable: true })
  packing: string;

  @ApiProperty({ nullable: true })
  isOrientation: boolean;

  @ApiProperty({ nullable: true })
  isTitle: boolean;

  @ApiProperty({ nullable: true })
  isContent: boolean;

  @ApiProperty({ nullable: true })
  isJustification: boolean;

  @ApiProperty({ nullable: true })
  examId: number;

  @ApiProperty({ nullable: true })
  medicineId: number;

  @ApiProperty({ nullable: true, default: 0 })
  quantity: number;

  @ApiProperty()
  exam?: IMedicalExamDto;
}

export class IPrescriptionFullInfoDto {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  idPrescriptionType: number;

  @ApiProperty()
  assigned: boolean;

  @ApiProperty()
  patientId: number;

  @ApiProperty()
  doctorId: number;

  @ApiProperty()
  ownerAddressId?: number;

  @ApiProperty()
  documentTypeId: number;

  @ApiProperty()
  date: string;

  @ApiProperty()
  hour: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  idDocument: string;

  @ApiProperty({ default: true })
  shouldShowDate: boolean;

  @ApiProperty()
  linkSigned: string;
  @ApiProperty()
  prescriptionComposition: PrescriptionComposition[];
}

export class IWhatsLink {
  @ApiProperty()
  whatsLink: string;

  @ApiProperty()
  link?: string;
}
