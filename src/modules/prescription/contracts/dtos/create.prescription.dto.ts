import { ApiProperty } from '@nestjs/swagger';
import { DocumentTypeEnum } from '../../../../shared/enum/document.type.enum';
import { PrescriptionTypeEnum } from '../../../../shared/enum/prescription.type.enum';
import { ICreatePrescriptionCompositionDto } from './create.prescription.composition.dto';

export class ICreatePrescriptionDto {
  @ApiProperty({ description: 'Id do paciente' })
  patientId: number;

  @ApiProperty({ description: 'Id do médico' })
  doctorId: number;

  @ApiProperty({ description: 'Lista de prescrições' })
  prescriptionComposition: Array<ICreatePrescriptionCompositionDto>;

  @ApiProperty({ description: 'Tipo da prescrição' })
  prescriptionType: PrescriptionTypeEnum;

  @ApiProperty({ description: 'Tipo de documento' })
  documentTypeId: DocumentTypeEnum;

  @ApiProperty({ description: 'Data do atestado' })
  date?: string;

  @ApiProperty({ description: 'Hora do atestado' })
  hour?: string;

  @ApiProperty({ description: 'Documento foi assinado ou não' })
  signed?: boolean;

  @ApiProperty({
    description: 'Deve ou não mostrar a data no documento impresso',
  })
  shouldShowDate: boolean;
}
