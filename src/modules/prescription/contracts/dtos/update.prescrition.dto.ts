import { ApiProperty } from '@nestjs/swagger';
import { PrescriptionTypeEnum } from 'src/shared/enum/prescription.type.enum';
import { IPersonDto } from '../../../person/contracts/dtos/person/person.dto';
import { IUpdatePrescriptionCompositionDto } from './update.prescription.composition.dto';

export class IUpdatePrescriptionDto {
  @ApiProperty({ description: 'Id da prescrição' })
  prescriptionId: number;

  @ApiProperty({ description: 'Id do paciente' })
  patientId: number;

  @ApiProperty({ description: 'Id do médico' })
  doctorId: number;

  @ApiProperty({ description: 'Lista de prescrições' })
  prescriptionComposition: Array<IUpdatePrescriptionCompositionDto>;

  @ApiProperty({ description: 'Tipo da prescrição' })
  prescriptionType: PrescriptionTypeEnum;

  @ApiProperty({ description: 'Id do endereçp de atendimento' })
  ownerAddressId: number;

  @ApiProperty({ description: 'Id do tipo de documento' })
  documentTypeId: number;

  @ApiProperty({ description: 'Hora do atestado' })
  hour: string;

  @ApiProperty({ description: 'Id do tipo de prescrição' })
  idPrescriptionType: number;

  @ApiProperty({ description: 'Data do atestado' })
  date: string;

  @ApiProperty({ description: 'Data do ultimo update do registro' })
  updateDate: Date;

  @ApiProperty({
    description: 'Flag para saber se o documento está assinado digitalmente',
  })
  assigned: boolean;

  @ApiProperty({ description: 'Flag para desabilitar o registro' })
  active: boolean;

  @ApiProperty({ description: 'Informações do paciente atrelado ao documento' })
  person: Array<IPersonDto>;
}
