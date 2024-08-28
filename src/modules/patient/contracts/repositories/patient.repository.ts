import { Patient } from '../../infra/domain/entities/patient.entity';

interface IPatientRepository {
  create(idPerson: number, idDoctor): Promise<Patient>;
  list(): Promise<Patient[]>;
  findBy(parameter: string, value: number): Promise<Patient[]>;
}

export { IPatientRepository };
