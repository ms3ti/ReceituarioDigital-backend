import { ApiProperty } from '@nestjs/swagger';

export class ICreatedAddressDto {
  [x: string]: any;
  @ApiProperty()
  ownerAddressId: number;
  @ApiProperty()
  cep: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  street: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  complement: string | undefined;

  @ApiProperty({ default: true })
  active: boolean;

  @ApiProperty()
  state: string;

  @ApiProperty()
  district: string;
  @ApiProperty()
  idPerson: number;

  @ApiProperty()
  idAdress: number;

  @ApiProperty({ nullable: true })
  cnpj?: string;

  @ApiProperty({ nullable: false, description: `It's default address` })
  isDefault?: boolean;

  @ApiProperty({ nullable: true })
  ownerName?: string;

  @ApiProperty({ nullable: true })
  ownerPhone?: string;

  @ApiProperty({ nullable: true })
  ownerPhone2?: string;

  @ApiProperty({ nullable: true })
  ownerEmail?: string;

  @ApiProperty({ nullable: true })
  imageName?: string;

  @ApiProperty({ nullable: true })
  imageUrl?: string;
}
