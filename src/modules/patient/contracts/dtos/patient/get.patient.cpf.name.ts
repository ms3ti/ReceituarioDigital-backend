import { ApiProperty } from '@nestjs/swagger';

export class IGetPatientCpfNameDto {
  @ApiProperty({ description: 'idDoctor' })
  idDoctor: number;

  @ApiProperty({ description: 'Name/Cpf' })
  element: string;
}
