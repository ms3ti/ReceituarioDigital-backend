import { ApiProperty } from '@nestjs/swagger';
import { ICreatePersonDto } from 'src/modules/person/contracts/dtos/person/create.person.dto';

export class ICreatePatientDto extends ICreatePersonDto {
  @ApiProperty({ description: 'idDoctor' })
  idDoctor: number;
}
