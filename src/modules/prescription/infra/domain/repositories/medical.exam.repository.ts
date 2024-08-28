import { EntityManager, Like, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MedicalExam } from '../entities/medicalExam.entity';
import { IMedicalExamDto } from '../../../contracts/dtos/medical.exam.dto';

@Injectable()
class MedicalExcamRepository {
  private ormRepository: Repository<MedicalExam>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(MedicalExam);
  }

  async listByName(value: string) {
    return await this.ormRepository.find({
      where: { name: Like(`%${value}%`) },
      order: { name: 'ASC' },
      take: 100,
    });
  }

  async getByID(examId: number): Promise<IMedicalExamDto> {
    return await this.ormRepository.findOneBy({ id: examId });
  }
}

export { MedicalExcamRepository };
