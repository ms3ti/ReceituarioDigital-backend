import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IChangePassword {
  @ApiProperty({ description: 'Email do usuário' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Senha antiga' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: 'Nova senha' })
  @IsString()
  newPassword: string;
}
