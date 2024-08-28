import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ICreateAddressDto } from '../../contracts/dtos/address/create.address.dto';
import { IUpdateAddressDto } from '../../contracts/dtos/address/update.address.dto';
import { IAddressRepository } from '../../../person/contracts/repositories/address.repository';
import { Address } from '../../../person/infra/domain/entities/address.entity';

@Injectable()
class AddressRepository implements IAddressRepository {
  private ormRepository: Repository<Address>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Address);
  }

  public async create(rawAddress: ICreateAddressDto): Promise<Address> {
    const address = this.ormRepository.create(rawAddress);
    await this.ormRepository.save(address);
    return address;
  }

  public async update(id: number, newAddress: IUpdateAddressDto) {
    await this.ormRepository.update(id, newAddress);
  }

  public async getById(id: number) {
    return await this.ormRepository.findOne({ where: { id: id } });
  }
}

export { AddressRepository };
