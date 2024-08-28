import { Person } from '../../infra/domain/entities/person.entity';
import { ICreatePersonDto } from '../dtos/person/create.person.dto';

interface IPersonRepository {
  create(Person: ICreatePersonDto): Promise<Person>;
  list(): Promise<Person[]>;
  listByCpfName(idDoctor, element);
  listByName(name);
  findByEmail(email);
}

export { IPersonRepository };
