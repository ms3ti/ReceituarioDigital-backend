import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ICreatePersonDto } from 'src/modules/person/contracts/dtos/person/create.person.dto';
import { ICreateDoctorSpecialtiesDto } from './create.doctor.specialties.dto';

export class ICreateDoctorDto extends ICreatePersonDto {
  id?: number;
  idPerson: number;

  @ApiProperty({ description: 'CRM' })
  @IsNumber()
  @IsNotEmpty({ message: 'O Número do Conselho é obrigatório' })
  crm: number;

  @ApiProperty({ description: 'councilType' })
  @IsNotEmpty({ message: 'O Conselho Regional é obrigatório' })
  councilType: number;

  @ApiProperty({ description: 'councilUf' })
  @IsString({ message: 'CRM - UF: Valor informado não é do tipo string.' })
  councilUf: string;

  @ApiProperty({ description: 'plan', default: 'trail' })
  plan: string;

  @ApiProperty({ description: 'date plan', default: () => 'CURRENT_TIMESTAMP' })
  date_plan: Date;

  @ApiProperty({ description: 'Lista de especialidades' })
  doctorSpecialty: Array<ICreateDoctorSpecialtiesDto>;

  @ApiProperty({ description: 'Login password' })
  password: string;
}
