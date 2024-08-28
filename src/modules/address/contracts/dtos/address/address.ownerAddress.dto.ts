import { ApiProperty } from '@nestjs/swagger';

export class IAddressOwnerAddressDto {
  @ApiProperty()
  ownerName?: string;

  @ApiProperty()
  ownerPhone?: string;

  @ApiProperty()
  ownerEmail?: string;

  @ApiProperty()
  isDefault?: boolean;

  @ApiProperty()
  cnpj?: string;

  @ApiProperty()
  cep: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  complement: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  district: string;

  @ApiProperty()
  addressId: number;

  @ApiProperty()
  ownerAddressId: number;
}
