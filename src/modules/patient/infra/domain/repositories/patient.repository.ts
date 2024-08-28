import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Patient } from '../entities/patient.entity';
import { IPatientRepository } from 'src/modules/patient/contracts/repositories/patient.repository';

@Injectable()
class PatientRepository implements IPatientRepository {
  private ormRepository: Repository<Patient>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Patient);
  }

  public async create(idPerson: number, idDoctor: number): Promise<Patient> {
    const patient = this.ormRepository.create({
      idPerson: idPerson,
      idDoctor: idDoctor,
    });
    await this.ormRepository.save(patient);
    return patient;
  }

  public async list() {
    const result = await this.ormRepository.find();
    return result;
  }

  public async findBy(
    parameter: string,
    value: number,
    active = true,
  ): Promise<Patient[]> {
    return await this.ormRepository.find({
      where: { [parameter]: value, active },
    });
  }

  public async findByIgnoringActive(
    parameter: string,
    value: number,
  ): Promise<Patient[]> {
    return await this.ormRepository.find({
      where: { [parameter]: value },
    });
  }

  public async findByAnyActive(
    parameter: string,
    value: number,
  ): Promise<Patient[]> {
    return await this.ormRepository.find({
      where: { [parameter]: value },
    });
  }

  public async findByPersonIdAndDoctorId(
    idPerson: number,
    idDoctor: number,
  ): Promise<Patient[]> {
    return await this.ormRepository
      .createQueryBuilder('patient')
      .where('patient.idPerson = :idPerson', { idPerson })
      .andWhere('patient.idDoctor = :idDoctor', { idDoctor })
      .getMany();
  }

  public async disable(patientId: string) {
    return await this.ormRepository.update(patientId, {
      active: false,
    });
  }

  async findByPersonId(id: number): Promise<Patient> {
    return await this.ormRepository.findOneBy({
      idPerson: id,
    });
  }
}

export { PatientRepository };
