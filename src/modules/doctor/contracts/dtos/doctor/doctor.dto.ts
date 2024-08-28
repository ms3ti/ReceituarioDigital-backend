import { PersonTypeEnum } from '../../../../../shared/enum/person.type.enum';
import { RegionalCouncilEnum } from '../../../../../shared/enum/regional.council.enum';
import { IAddressOwnerAddressDto } from '../../../../address/contracts/dtos/address/address.ownerAddress.dto';
import { IDoctorSpecialityDto } from './doctor.speciality.dto';
import { ApiProperty } from '@nestjs/swagger';

export class IDoctorDto {
  @ApiProperty()
  crm: string;

  @ApiProperty()
  doctorSpecialty: IDoctorSpecialityDto[];

  @ApiProperty()
  doctorId: number;

  @ApiProperty({
    enum: PersonTypeEnum,
    example: PersonTypeEnum.ADMIN,
  })
  personType: PersonTypeEnum;

  @ApiProperty()
  name: string;

  @ApiProperty()
  socialName: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  mothersName?: string;

  @ApiProperty()
  address: IAddressOwnerAddressDto;

  @ApiProperty()
  personId: number;

  @ApiProperty({
    enum: RegionalCouncilEnum,
    example: RegionalCouncilEnum.CRBM,
  })
  councilType: RegionalCouncilEnum;

  @ApiProperty()
  councilUf: string;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  date_plan: Date;
  @ApiProperty()
  sex: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  id?: number;

  @ApiProperty()
  active?: boolean;

  @ApiProperty()
  createDate?: Date;

  @ApiProperty()
  updateDate?: Date;

  @ApiProperty()
  idPerson?: number;
}
