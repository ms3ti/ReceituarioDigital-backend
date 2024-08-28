import { DoctorSpecialties } from '../../infra/domain/entities/doctor.specialties';
import { ICreateDoctorSpecialtiesDto } from '../dtos/doctor/create.doctor.specialties.dto';

interface IDoctorSpecialtyRepository {
  create(Person: ICreateDoctorSpecialtiesDto): Promise<DoctorSpecialties>;
  list(): Promise<DoctorSpecialties[]>;
}

export { IDoctorSpecialtyRepository };
