import { ApiProperty } from '@nestjs/swagger';

export class IMedicalExamDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  createDate?: Date;
  @ApiProperty()
  updateDate?: Date;
  @ApiProperty()
  name: string;
}
