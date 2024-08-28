import { ICreateAddressDto } from './create.address.dto';

export class ICreateAddressPayloadDto extends ICreateAddressDto {
  personId: number;
  companyLogo: any;
}
