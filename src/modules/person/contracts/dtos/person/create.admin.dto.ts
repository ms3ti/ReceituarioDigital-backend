import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ICreatePersonDto } from './create.person.dto';

export class ICreateAdminDto extends ICreatePersonDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
