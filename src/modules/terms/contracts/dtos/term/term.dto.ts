import { ApiProperty } from '@nestjs/swagger';

export class ITermDto {
  @ApiProperty()
  term: string;
}
