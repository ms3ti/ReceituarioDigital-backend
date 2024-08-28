import { ApiProperty } from '@nestjs/swagger';

export class IGetPaginationDto {
  @ApiProperty({ description: 'Id da prescrição' })
  id: number;

  @ApiProperty({ description: 'Nome do paciente' })
  patientName: string;

  @ApiProperty({ description: 'Data de criação da prescrição' })
  createDate: Date;

  @ApiProperty({ description: 'Assinatura da prescrição já foi criada' })
  assigned: boolean;

  @ApiProperty({ description: 'Data de criação da prescrição' })
  assignDate: Date;

  @ApiProperty({ description: 'Tipo do documento' })
  documentTypeId: number;

  @ApiProperty({ description: 'Tipo de prescrição' })
  idPrescriptionType: number;

  @ApiProperty({ description: 'Flag para mostrar a data no PDF ou não' })
  shouldShowDate: boolean;
}
