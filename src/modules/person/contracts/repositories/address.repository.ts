import { Address } from '../../infra/domain/entities/address.entity';
import { ICreateAddressDto } from '../../../address/contracts/dtos/address/create.address.dto';

interface IAddressRepository {
  create(address: ICreateAddressDto): Promise<Address>;
}

export { IAddressRepository };
