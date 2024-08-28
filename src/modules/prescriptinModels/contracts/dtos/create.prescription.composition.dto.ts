import { ApiProperty } from '@nestjs/swagger';

export class ICreatePrescriptionCompositionModelDto {
  @ApiProperty({ description: 'Descrição da prescrição' })
  description: string;

  @ApiProperty({ description: 'Medicamento', nullable: true })
  medicine: string;

  @ApiProperty({ description: 'Principio ativo', nullable: true })
  activePrinciple: string;

  @ApiProperty({ description: 'Posologia', nullable: true })
  dosage: string;

  @ApiProperty({ description: 'Embalagem', nullable: true })
  packing: string;
}
