import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DoctorSpecialties } from '../entities/doctor.specialties';
import { IDoctorSpecialtyRepository } from 'src/modules/doctor/contracts/repositories/doctor.specialty.repository';
import { ICreateDoctorSpecialtiesDto } from 'src/modules/doctor/contracts/dtos/doctor/create.doctor.specialties.dto';
import { IDoctorSpecialityDto } from '../../../contracts/dtos/doctor/doctor.speciality.dto';

@Injectable()
class DoctorSpecialtyRepository implements IDoctorSpecialtyRepository {
  private ormRepository: Repository<DoctorSpecialties>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(DoctorSpecialties);
  }

  public async create({
    idDoctor,
    specialty,
    registrationNumber,
  }: ICreateDoctorSpecialtiesDto): Promise<DoctorSpecialties> {
    const doctorSpecialty = this.ormRepository.create({
      idDoctor: idDoctor,
      specialty: specialty,
      registrationNumber: registrationNumber,
    });
    await this.ormRepository.save(doctorSpecialty);
    return doctorSpecialty;
  }

  public async list() {
    const result = await this.ormRepository.find();
    return result;
  }

  public async getByDoctorId(
    doctorId: number,
  ): Promise<IDoctorSpecialityDto[]> {
    const result = await this.ormRepository.findBy({ idDoctor: doctorId });
    return result;
  }

  public async update(id: number, body: IDoctorSpecialityDto) {
    return await this.ormRepository.update(id, body);
  }

  public async delete(id: number) {
    return await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from(DoctorSpecialties)
      .where('idDoctor = :idDoctor', { idDoctor: id })
      .execute();
  }

  public async deleteById(id: number) {
    return await this.ormRepository.delete(id);
  }
}
export { DoctorSpecialtyRepository };
