import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IForgotPassword {
  @ApiProperty({ description: 'Email do usuário' })
  @IsString()
  email: string;
}
