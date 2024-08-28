import { Doctor } from '../../infra/domain/entities/doctor.entity';

interface IDoctorRepository {
  create(
    idPerson: number,
    crm: string,
    councilType: number,
    councilUf: string,
    plan: string,
    date_plan: Date,
  ): Promise<Doctor>;
  list(): Promise<Doctor[]>;
}

export { IDoctorRepository };
