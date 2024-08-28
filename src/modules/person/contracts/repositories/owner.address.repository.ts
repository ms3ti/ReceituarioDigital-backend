import { OwnerAddress } from '../../infra/domain/entities/owner.address.entity';
import { ICreateOwnerAddressDto } from '../dtos/ownerAddress/create.owner.address.dto';

interface IOwnerAddressRepository {
  create(ownerAddress: ICreateOwnerAddressDto): Promise<OwnerAddress>;
  findByPersonId(personId: number, isDefault: boolean): Promise<OwnerAddress>;
}

export { IOwnerAddressRepository };
