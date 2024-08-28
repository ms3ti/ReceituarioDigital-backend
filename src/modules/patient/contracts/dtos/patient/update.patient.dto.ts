import { ApiProperty } from '@nestjs/swagger';
import { IAddressOwnerAddressDto } from '../../../../address/contracts/dtos/address/address.ownerAddress.dto';

export class IUpdatePatientById {
  @ApiProperty()
  cpf: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  mothersName: string;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  personType: number;

  @ApiProperty()
  socialName: string;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  patientId: number;

  @ApiProperty()
  personId: number;

  @ApiProperty()
  address: IAddressOwnerAddressDto;
}
