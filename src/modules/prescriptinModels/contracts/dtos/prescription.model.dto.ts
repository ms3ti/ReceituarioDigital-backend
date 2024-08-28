import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../../../person/infra/domain/entities/person.entity';
import { PrescriptionCompositionModel } from '../../infra/domain/entities/prescriptionComposition.entity';
export class IPrescriptionComposition {
  @ApiProperty()
  prescriptionModelId: number;

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

  @ApiProperty({ nullable: true, default: true })
  quantity: number;
}
export class IPrescriptionModelDto {
  @ApiProperty()
  idPrescriptionType: number;

  @ApiProperty()
  doctorId: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  documentTypeId: number;
  @ApiProperty()
  prescriptionComposition?: PrescriptionCompositionModel[];

  @ApiProperty()
  prescriptionCompositonsModels?: PrescriptionCompositionModel[];
  @ApiProperty()
  person: Person[];

  @ApiProperty()
  date: string;

  @ApiProperty()
  hour: string;
}
