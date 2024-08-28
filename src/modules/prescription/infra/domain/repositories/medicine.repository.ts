import { EntityManager, Like, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Medicine } from '../entities/medicine.entity';
import { IMedicineDto } from '../../../contracts/dtos/medicine.dto';

@Injectable()
class MedicineRepository {
  private ormRepository: Repository<Medicine>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Medicine);
  }

  async listByName(value: string) {
    return await this.ormRepository.find({
      where: [
        { substance: Like(`%${value}%`) },
        { product: Like(`%${value}%`) },
        { presentation: Like(`%${value}%`) },
      ],
      order: { substance: 'ASC' },
      take: 100,
    });
  }

  async getByID(medicineId: number): Promise<IMedicineDto> {
    return await this.ormRepository.findOneBy({ id: medicineId });
  }
}

export { MedicineRepository };
