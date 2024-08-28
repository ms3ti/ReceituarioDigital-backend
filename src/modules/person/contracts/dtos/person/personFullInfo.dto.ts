import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { PersonTypeEnum } from '../../../../../shared/enum/person.type.enum';
import { RegionalCouncilEnum } from '../../../../../shared/enum/regional.council.enum';
import { IAddressOwnerAddressDto } from '../../../../address/contracts/dtos/address/address.ownerAddress.dto';
import { IDoctorSpecialityDto } from '../../../../doctor/contracts/dtos/doctor/doctor.speciality.dto';

export class IPersonFullInfoDto {
  id?: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'Nome: Valor informado não é do tipo string.' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  @IsString({ message: 'E-mail: Valor informado não é do tipo string.' })
  email?: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'A Data de Nascimento é obrigatória.' })
  birthDate?: Date;

  @ApiProperty()
  @IsString({ message: 'Valor informado não é texto.' })
  cpf?: string;

  @ApiProperty()
  @IsBoolean()
  approve?: boolean;

  @ApiProperty({ description: 'Male | Female' })
  @IsNotEmpty({ message: 'O sexo é obrigatório.' })
  @IsString({ message: 'Sexo: Valor informado não é do tipo string.' })
  sex?: string;

  @ApiProperty({ description: 'Nome social' })
  @IsString({ message: 'Nome Social: Valor informado não é do tipo string.' })
  socialName?: string;

  @ApiProperty({ description: 'Telefone' })
  @IsString({ message: 'Valor informado não é do tipo string.' })
  @IsNotEmpty({ message: 'Telefone: O telefone é obrigatório.' })
  phoneNumber?: string;

  personType: PersonTypeEnum;

  @IsString({ message: 'Nome da mãe: Valor informado não é do tipo string.' })
  mothersName?: string;

  @ApiProperty({ description: 'Nome social do responsável' })
  responsibleSocialName?: string;

  @ApiProperty({ description: 'Nome do responsável' })
  responsibleName?: string;

  @ApiProperty({ description: 'CPF do responsável' })
  responsibleCPF?: string;

  hasResponsible?: boolean;

  @ApiProperty()
  crm: string;

  @ApiProperty()
  doctorSpecialty: IDoctorSpecialityDto[];

  @ApiProperty()
  doctorId: number;

  @ApiProperty()
  address: IAddressOwnerAddressDto;

  @ApiProperty()
  personId: number;

  @ApiProperty()
  councilType: RegionalCouncilEnum;

  @ApiProperty()
  councilUf: string;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  date_plan: Date;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  active?: boolean;

  @ApiProperty()
  createDate?: Date;

  @ApiProperty()
  updateDate?: Date;

  @ApiProperty()
  idPerson?: number;
}
