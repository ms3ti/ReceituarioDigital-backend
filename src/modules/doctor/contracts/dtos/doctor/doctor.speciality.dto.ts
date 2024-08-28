import { ApiProperty } from '@nestjs/swagger';
export class IDoctorSpecialityDto {
  @ApiProperty({ description: 'id da especialidade do médico' })
  id: number;

  @ApiProperty({ description: 'data de criação' }) active: boolean;
  createDate?: Date;

  @ApiProperty({ description: 'data de atuaçlização' })
  updateDate?: Date;

  @ApiProperty({ description: 'id do médico' })
  idDoctor: number;

  @ApiProperty({ description: 'nome da especializade' })
  specialty: string;

  @ApiProperty({ description: 'número do registro da especialidade' })
  registrationNumber: string;
}
