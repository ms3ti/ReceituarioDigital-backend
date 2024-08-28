import { ICreateAddressDto } from './create.address.dto';

export class IUpdateAddressDto extends ICreateAddressDto {
  updateDate: Date;
  street: string;
}
