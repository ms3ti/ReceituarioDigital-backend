import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { IAddressDto } from '../../../../address/contracts/dtos/address/IAddress.dto';

export class IListPatientDto {
  @ApiProperty()
  patientId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'Nome: Valor informado não é do tipo string.' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  @IsString({ message: 'E-mail: Valor informado não é do tipo string.' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'A Data de Nascimento é obrigatória.' })
  birthDate: Date;

  @ApiProperty()
  @IsString({ message: 'Valor informado não é texto.' })
  cpf?: string;

  @ApiProperty()
  @IsBoolean()
  approve?: boolean;

  @ApiProperty({ description: 'Male | Female' })
  @IsNotEmpty({ message: 'O sexo é obrigatório.' })
  @IsString({ message: 'Sexo: Valor informado não é do tipo string.' })
  sex: string;

  @ApiProperty({ description: 'Nome social' })
  @IsString({ message: 'Nome Social: Valor informado não é do tipo string.' })
  socialName?: string;

  @ApiProperty({ description: 'Telefone' })
  @IsString({ message: 'Telefone: Valor informado não é do tipo string.' })
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  phoneNumber: string;

  personType: number;

  @IsString({ message: 'Nome da Mãe: Valor informado não é do tipo string.' })
  mothersName?: string;

  @ApiProperty({ description: 'Id do doutor que está criando o paciente' })
  idDoctor?: number;

  @ApiProperty({ description: 'Nome social do responsável' })
  responsibleSocialName?: string;

  @ApiProperty({ description: 'Nome do responsável' })
  responsibleName?: string;

  @ApiProperty({ description: 'CPF do responsável' })
  responsibleCPF?: string;
  hasResponsible?: boolean;

  @ApiProperty()
  address: IAddressDto;
}
