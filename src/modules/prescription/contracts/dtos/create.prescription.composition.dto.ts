import { ApiProperty } from '@nestjs/swagger';

export class ICreatePrescriptionCompositionDto {
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

  @ApiProperty({ description: 'Diz se é a orientação do atestado' })
  isOrientation: boolean;

  @ApiProperty({ description: 'Diz se é titulo' })
  isTitle: boolean;

  @ApiProperty({ description: 'Diz se é conteudo' })
  isContent: boolean;

  @ApiProperty({ description: 'Diz se é justificativa' })
  isJustification: boolean;

  @ApiProperty({ description: 'ID do exame' })
  examId: number;

  @ApiProperty({ description: 'ID do remédio' })
  medicineId: number;

  @ApiProperty({ description: 'Quantidade de embalagens do medicamento' })
  quantity: number;
}
