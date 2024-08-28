import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ICreateAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'O estado é obrigatório' })
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  cep: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'A cidade é obrigatório' })
  city: string;

  @ApiProperty({ description: 'Bairro' })
  @IsString()
  @IsNotEmpty({ message: 'O distrito é obrigatório' })
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'O rua é obrigatório' })
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'O número é obrigatório' })
  number: string;

  @ApiProperty()
  @IsString()
  complement?: string;

  @ApiProperty()
  @IsString()
  cnpj?: string;

  @ApiProperty()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty()
  @IsString()
  ownerName?: string;

  @ApiProperty()
  @IsString()
  ownerPhone?: string;

  @ApiProperty()
  @IsString()
  ownerPhone2?: string;

  @ApiProperty()
  @IsString()
  ownerEmail?: string;
}
