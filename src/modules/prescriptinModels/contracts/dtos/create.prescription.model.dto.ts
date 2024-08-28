import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DocumentTypeEnum } from 'src/shared/enum/document.type.enum';
import { PrescriptionTypeEnum } from '../../../../shared/enum/prescription.type.enum';
import { ICreatePrescriptionCompositionModelDto } from './create.prescription.composition.dto';

export class ICreatePrescriptionModelDto {
  @ApiProperty({ description: 'Id do médico' })
  @IsNotEmpty()
  doctorId: number;

  @ApiProperty({ description: 'Titulo da prescrição' })
  @IsNotEmpty({ message: 'O titulo é obrigatório' })
  title: string;

  @ApiProperty({ description: 'Lista de prescrições' })
  @IsNotEmpty()
  prescriptionComposition: Array<ICreatePrescriptionCompositionModelDto>;

  @ApiProperty({ description: 'Tipo da prescrição' })
  @IsNotEmpty()
  prescriptionType: PrescriptionTypeEnum;

  @ApiProperty({ description: 'Tipo da prescrição' })
  @IsNotEmpty()
  documentTypeId: DocumentTypeEnum;

  @ApiProperty({ description: 'Data do atestado' })
  date: string;

  @ApiProperty({ description: 'Hora do atestado' })
  hour: string;
}
