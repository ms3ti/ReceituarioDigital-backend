import { Injectable } from '@nestjs/common';
import { IDoctorRepository } from 'src/modules/doctor/contracts/repositories/doctor.repository';
import { EntityManager, Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
class DoctorRepository implements IDoctorRepository {
  private ormRepository: Repository<Doctor>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Doctor);
  }

  public async create(
    idPerson: number,
    crm: string,
    councilType: number,
    councilUf: string,
    plan: string,
    date_plan: Date,
  ): Promise<Doctor> {
    const doctor = this.ormRepository.create({
      idPerson,
      crm,
      councilType,
      councilUf,
      plan,
      date_plan,
    });
    await this.ormRepository.save(doctor);
    return doctor;
  }

  public async list() {
    const result = await this.ormRepository.find();
    return result;
  }

  public async getById(id: number) {
    const result = await this.ormRepository.findOneBy({ id: id });
    return result;
  }

  public async update(id: number, body: { crm: string }) {
    return await this.ormRepository.update(id, body);
  }

  public async updateDatePlan(id: number, body: { date_plan: Date | string }) {
    return await this.ormRepository.update(id, body);
  }

  public async updatePlan(id: number, body: { plan: string }) {
    return await this.ormRepository.update(id, body);
  }

  public async findBy(parameter: string, value: string) {
    return await this.ormRepository.find({ where: { [parameter]: value } });
  }

  public async findByDoctor(parameter: string, value: string) {
    return await this.ormRepository.find({ where: { [parameter]: value } });
  }

  public async delete(id: number) {
    return await this.ormRepository.delete(id);
  }
}
export { DoctorRepository };
