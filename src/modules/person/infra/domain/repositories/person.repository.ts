import { Injectable } from '@nestjs/common';
import { IPersonRepository } from 'src/modules/person/contracts/repositories/person.repository';
import { EntityManager, Like, Repository } from 'typeorm';
import { removeMask } from '../../../../../shared/removeMask';
import { IPatchPatientDto } from '../../../../patient/contracts/dtos/patient/patch.patient.dto';
import { ICreatePersonDto } from '../../../contracts/dtos/person/create.person.dto';
import { IUpdatePersonDto } from '../../../contracts/dtos/person/update.person.dto';
import { Person } from '../entities/person.entity';

@Injectable()
class PersonRepository implements IPersonRepository {
  private ormRepository: Repository<Person>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Person);
  }

  public async create(rawPerson: ICreatePersonDto): Promise<Person> {
    const person = this.ormRepository.create({
      ...rawPerson,
      username: removeMask.cpf(rawPerson.cpf),
    });
    if (person.personType === 3) {
      person.active = true;
      person.approve = true;
    } else {
      person.active = false;
      person.approve = false;
    }

    await this.ormRepository.save(person);
    return person;
  }

  public async list() {
    const result = await this.ormRepository.find();
    return result;
  }

  async findBy(parameter: string, value: string) {
    return await this.ormRepository.find({ where: { [parameter]: value } });
  }

  async findAdminOrDoctorBy(parameter: string, value: string) {
    return await this.ormRepository.find({
      where: [
        { [parameter]: value, personType: 2 },
        { [parameter]: value, personType: 3 },
      ],
    });
  }

  async findDoctorBy(parameter: string, value: string) {
    return await this.ormRepository.find({
      where: { [parameter]: value, personType: 2 },
    });
  }

  async updateCPF(patientId: string, body: IPatchPatientDto) {
    return await this.ormRepository.update(patientId, { ...body });
  }

  async updateBy(parameter: number | string, values: object): Promise<any> {
    return this.ormRepository.update(parameter, values);
  }

  async findByEmail(email: string): Promise<Person> {
    return await this.ormRepository.findOne({
      where: { email: email },
    });
  }

  async findDoctorByEmail(email: string): Promise<Person> {
    return await this.ormRepository.findOne({
      where: { email: email, personType: 2 },
    });
  }

  async findLoginByEmail(email: string): Promise<Person> {
    return await this.ormRepository.findOne({
      where: [
        { email: email, personType: 2 },
        { email: email, personType: 3 },
      ],
    });
  }

  async findByCPF(cpf: string): Promise<Person> {
    return await this.ormRepository.findOne({
      where: { cpf: cpf },
    });
  }

  async findDoctorByCPF(cpf: string): Promise<Person> {
    return await this.ormRepository.findOne({
      where: [{ cpf: cpf, personType: 2 }],
    });
  }

  async findById(value: number): Promise<Person[]> {
    return await this.ormRepository.find({ where: { ['id']: value } });
  }

  async findByIdAndNameOrCPF(
    parameter: string,
    value: string,
    queryField: string,
    queryValue: string,
  ) {
    const result = await this.ormRepository.find({
      where: {
        [parameter]: value,
        [queryField]: Like(`%${queryValue}%`),
      },
    });
    return result;
  }

  async update(id: string, body: IUpdatePersonDto) {
    type UpdatePesonDtoWithoutId = Omit<IUpdatePersonDto, 'id'>;
    const bodyWithoutId: UpdatePesonDtoWithoutId = body;
    bodyWithoutId.updateDate = new Date();
    await this.ormRepository.update(id, bodyWithoutId);
  }

  async updateActivedDoctor(id: string, body: any) {
    await this.ormRepository.update(id, body);
  }

  async updatePerson(id: string, body: any) {
    await this.ormRepository.update(id, body);
  }

  public async listByCpfName(idDoctor: number, nameOrCpf: string) {
    const result = await this.ormRepository
      .createQueryBuilder('person')
      .innerJoin('doctor', 'doctor.id = ' + idDoctor)
      .where('person.name = :name', { name: nameOrCpf })
      .orWhere('person.cpf = :cpf', { cpf: nameOrCpf })
      .getMany();

    return result;
  }

  public async listByName(name: string) {
    const result = await this.ormRepository
      .createQueryBuilder('person')
      .where('person.name like :name', { name: `%${name}%` })
      .andWhere('person.personType = 1')
      .getMany();

    return result;
  }

  public async delete(personId: number) {
    return await this.ormRepository.delete(personId);
  }

  async findByCPFAnyDoctor(cpf: string) {
    return await this.ormRepository.findOne({
      where: { cpf: cpf, personType: 1 },
      order: {
        updateDate: 'desc',
      },
    });
  }

  async disable(id: number) {
    return await this.ormRepository.update(id, {
      active: false,
    });
  }

  async enable(id: number) {
    return await this.ormRepository.update(id, {
      active: true,
    });
  }

  async findPatientByCPFAndDoctorId(cpf: string, doctorId: number) {
    const result = await this.ormRepository
      .createQueryBuilder('person')
      .innerJoinAndSelect('patient', 'p', 'p.idPerson = person.id')
      .where('person.cpf = :cpf', { cpf: cpf })
      .andWhere('p.idDoctor = :idDoctor', { idDoctor: doctorId })
      .andWhere('p.active = :active', { active: true })
      .getOne();
    return result;
  }

  async listDoctorByCPFAndName(queryField: string, queryValue: string) {
    const result = await this.ormRepository.find({
      where: {
        [queryField]: Like(`%${queryValue}%`),
        personType: 2,
      },
    });
    return result;
  }

  async listLatestDoctor(): Promise<Person[]> {
    return await this.ormRepository.find({
      where: {
        personType: 2,
      },
      order: {
        createDate: 'DESC',
      },
    });
  }

  async findAdminBy(parameter: string, value: string) {
    return await this.ormRepository.find({
      where: [{ [parameter]: value, personType: 3 }],
    });
  }

  async listAdminByCpfName(queryValue: string) {
    const result = await this.ormRepository.find({
      where: [
        { name: Like(`%${queryValue}%`), personType: 3, approve: true },
        { cpf: Like(`%${queryValue}%`), personType: 3, approve: true },
      ],
    });
    return result;
  }

  async updatePassword(id: number, hashedPassword: string) {
    await this.ormRepository.update(id, {
      password: hashedPassword,
    });
  }
}

export { PersonRepository };
