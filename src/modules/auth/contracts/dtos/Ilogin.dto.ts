import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ILoginDto {
  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Senha do usuário' })
  @IsString()
  password: string;
}
