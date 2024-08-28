import { ICreateAddressDto } from './create.address.dto';

export class IAddressDto implements ICreateAddressDto {
  id: number;
  active: boolean;
  cep: string;
  city: string;
  street: string;
  number: string;
  complement: string;
  state: string;
  district: string;
}
