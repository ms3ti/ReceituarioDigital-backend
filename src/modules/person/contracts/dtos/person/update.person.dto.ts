import { IPersonDto } from './person.dto';

export class IUpdatePersonDto extends IPersonDto {
  active?: boolean;
  approve?: boolean;
  updateDate?: Date;
}
