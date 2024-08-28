import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ICreateOwnerAddressDto } from '../../../person/contracts/dtos/ownerAddress/create.owner.address.dto';
import { IOwnerAddressDto } from '../../../person/contracts/dtos/ownerAddress/owner.address.dto';
import { IOwnerAddressRepository } from '../../../person/contracts/repositories/owner.address.repository';
import { OwnerAddress } from '../../../person/infra/domain/entities/owner.address.entity';

@Injectable()
class OwnerAddressRepository implements IOwnerAddressRepository {
  private ormRepository: Repository<OwnerAddress>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(OwnerAddress);
  }

  public async create({
    idAddress,
    idPerson,
    ownerEmail,
    ownerName,
    cnpj,
    isDefault,
    ownerPhone,
    ownerPhone2,
  }: ICreateOwnerAddressDto): Promise<OwnerAddress> {
    const result = this.ormRepository.create({
      idAdress: idAddress,
      idPerson: idPerson,
      cnpj,
      isDefault,
      ownerEmail,
      ownerName,
      ownerPhone,
      ownerPhone2,
    });
    await this.ormRepository.save(result);
    return result;
  }

  public async findByPersonId(personId: number, isDefault = true) {
    return await this.ormRepository.findOne({
      where: { idPerson: personId, isDefault },
    });
  }

  public async findById(addresId: number, isDefault = true) {
    return await this.ormRepository.findOne({
      where: { id: addresId, isDefault },
    });
  }

  public async findByPersonIdIsDefaultTrue(
    personId: number,
    isDefault: boolean,
  ) {
    return await this.ormRepository.findOne({
      where: { idPerson: personId, isDefault: isDefault, active: true },
    });
  }

  public async update(id: number, body: IOwnerAddressDto) {
    return await this.ormRepository.update(id, body);
  }

  public async listByPersonId(personId: number) {
    return await this.ormRepository.findBy({
      idPerson: personId,
      active: true,
    });
  }

  public async updateIsDefault(ownerAddressId: number, value: boolean) {
    return await this.ormRepository.update(ownerAddressId, {
      isDefault: value,
    });
  }

  public async disable(ownerAddressId: number) {
    return await this.ormRepository.update(ownerAddressId, {
      active: false,
    });
  }

  public async setImageName(ownerAddressId: string, fileName: string) {
    return await this.ormRepository.update(ownerAddressId, {
      imageName: fileName,
    });
  }

  public async removeImage(ownerAddressId: string) {
    return await this.ormRepository.update(ownerAddressId, {
      imageName: '',
    });
  }

  public async findByOwnerId(ownerAddressId: string) {
    return await this.ormRepository.findBy({
      id: Number(ownerAddressId),
    });
  }
}

export { OwnerAddressRepository };
