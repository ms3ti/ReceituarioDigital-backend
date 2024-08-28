import { ApiProperty } from '@nestjs/swagger';

export class IMedicineDto {
  @ApiProperty()
  substance: string;
  @ApiProperty()
  product: string;
  @ApiProperty()
  presentation: string;
  @ApiProperty()
  therapeuticClass: string;
  @ApiProperty()
  class: string;
  @ApiProperty()
  accept: boolean;
  @ApiProperty()
  id: number;
  @ApiProperty()
  active: boolean;
  @ApiProperty()
  createDate?: Date;
  @ApiProperty()
  updateDate?: Date;
}
