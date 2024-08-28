import { Injectable } from '@nestjs/common';
import { generateImageURL } from '../../../shared/generateImageUrl';
import { DoctorService } from '../../doctor/services/doctor.service';
import { IOwnerAddressDto } from '../../person/contracts/dtos/ownerAddress/owner.address.dto';
import { ICreateAddressPayloadDto } from '../contracts/dtos/address/create.address.payload.dto';
import { ICreatedAddressDto } from '../contracts/dtos/address/created.address.dto';
import { IUpdateAddressDto } from '../contracts/dtos/address/update.address.dto';
import { IAddressOwnerAddressPayloadDto } from '../contracts/dtos/address/update.address.ownerAddress.dto';
import { AddressRepository } from '../domain/repositories/address.repository';
import { OwnerAddressRepository } from '../domain/repositories/owner.address.repository';

@Injectable()
export class AddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly ownerAddressRepository: OwnerAddressRepository,
    private readonly doctorService: DoctorService,
  ) {}

  async createAddress(
    address: ICreateAddressPayloadDto,
  ): Promise<ICreatedAddressDto> {
    const addressResult = await this.addressRepository.create(address);
    const ownerAddressResult = await this.ownerAddressRepository.create({
      idAddress: addressResult.id,
      idPerson: address.personId,
      isDefault: false,
      ownerEmail: address.ownerEmail,
      ownerName: address.ownerName,
      ownerPhone: address.ownerPhone,
      cnpj: address.cnpj,
      ownerPhone2: address.ownerPhone2,
    });
    return {
      ownerAddressId: ownerAddressResult.id,
      ...ownerAddressResult,
      ...addressResult,
    };
  }

  async listAddress(personId: number): Promise<ICreatedAddressDto[]> {
    const result = [];
    const [doctor] = await this.doctorService.getDoctorByPersonId(personId);
    const ownerAddressResult = await this.ownerAddressRepository.listByPersonId(
      personId,
    );

    for (const ownerAddress of ownerAddressResult) {
      const addressResult = await this.addressRepository.getById(
        ownerAddress.idAdress,
      );
      const address: ICreatedAddressDto = {
        ownerAddressId: ownerAddress.id,
        imageUrl: ownerAddress.imageName
          ? generateImageURL(
              String(doctor.id),
              String(ownerAddress.id),
              ownerAddress.imageName,
            )
          : null,
        ...addressResult,
        ...ownerAddress,
      };
      delete address.id;
      result.push(address);
    }

    return result;
  }

  async setToDefault(ownerAddressId: number, personId: number) {
    await this.ownerAddressRepository.updateIsDefault(ownerAddressId, true);
    const list = await this.ownerAddressRepository.listByPersonId(personId);
    const idsList = list.filter(
      (ownerAddress) => ownerAddress.id != ownerAddressId,
    );

    for (const ownerAddress of idsList) {
      await this.ownerAddressRepository.updateIsDefault(ownerAddress.id, false);
    }
  }

  async editAddress(address: IAddressOwnerAddressPayloadDto) {
    const infoToUpdateAddress: Omit<IUpdateAddressDto, 'ownerName'> = {
      cep: address.cep,
      city: address.city,
      district: address.district,
      number: address.number,
      state: address.state,
      street: address.street,
      updateDate: new Date(),
      complement: address.complement,
    };
    const infoToUpdateOwnerAddress: IOwnerAddressDto = {
      ownerEmail: address.ownerEmail,
      ownerName: address.ownerName,
      ownerPhone: address.ownerPhone,
      updateDate: new Date(),
      ownerPhone2: address.ownerPhone2,
    };
    await this.addressRepository.update(address.idAdress, infoToUpdateAddress);
    await this.ownerAddressRepository.update(
      address.ownerAddressId,
      infoToUpdateOwnerAddress,
    );
  }

  async disabledOwnerAddress(ownerAddressId: number) {
    await this.ownerAddressRepository.disable(ownerAddressId);
  }
}
