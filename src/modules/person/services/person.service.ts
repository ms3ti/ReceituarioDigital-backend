import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddressRepository } from '../../address/domain/repositories/address.repository';
import { OwnerAddressRepository } from '../../address/domain/repositories/owner.address.repository';
import { ICreateDoctorSpecialtiesDto } from '../../doctor/contracts/dtos/doctor/create.doctor.specialties.dto';
import { IDoctorSpecialityDto } from '../../doctor/contracts/dtos/doctor/doctor.speciality.dto';
import { IUpdateDoctorDto } from '../../doctor/contracts/dtos/doctor/update.doctor.dto';
import { DoctorRepository } from '../../doctor/infra/domain/repositories/doctor.repository';
import { DoctorSpecialtyRepository } from '../../doctor/infra/domain/repositories/doctor.specialties.repository';
import { IPatchPatientDto } from '../../patient/contracts/dtos/patient/patch.patient.dto';
import { IUpdatePatientById } from '../../patient/contracts/dtos/patient/update.patient.dto';
import { PatientRepository } from '../../patient/infra/domain/repositories/patient.repository';
import { IUpdateAdminDto } from '../contracts/dtos/person/update.admin.dto';
import { ICreatePersonDto } from '../contracts/dtos/person/create.person.dto';
import { Person } from '../infra/domain/entities/person.entity';
import { PersonRepository } from '../infra/domain/repositories/person.repository';
import { IPersonDto } from '../contracts/dtos/person/person.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PersonService {
  constructor(
    public readonly personRepository: PersonRepository,
    public readonly addressRepository: AddressRepository,
    public readonly ownerAddressRepository: OwnerAddressRepository,
    public readonly doctorRepository: DoctorRepository,
    public readonly doctorSpeciality: DoctorSpecialtyRepository,
    public readonly patientRepository: PatientRepository,
  ) {
    this.personRepository = personRepository;
    this.addressRepository = addressRepository;
    this.doctorRepository = doctorRepository;
    this.patientRepository = patientRepository;
    this.doctorSpeciality = doctorSpeciality;
    this.ownerAddressRepository = ownerAddressRepository;
  }

  async create(person: ICreatePersonDto): Promise<Person> {
    const newPerson = await this.personRepository.create(person);
    const newAddress = await this.addressRepository.create(person.address);
    await this.ownerAddressRepository.create({
      idAddress: newAddress.id,
      idPerson: newPerson.id,
      ownerEmail: '',
      isDefault: true,
      ownerName: '',
      ownerPhone: '',
      ownerPhone2: '',
    });
    const result = {
      address: newAddress,
      ...newPerson,
    };
    return result;
  }

  async listPerson(): Promise<Person[]> {
    return await this.personRepository.list();
  }

  async findBy(parameter: string, value: string) {
    return await this.personRepository.findBy(parameter, value);
  }

  async findAdminOrDoctorBy(parameter: string, value: string) {
    return await this.personRepository.findAdminOrDoctorBy(parameter, value);
  }

  async findDoctorBy(parameter: string, value: string) {
    return await this.personRepository.findDoctorBy(parameter, value);
  }

  async findAdminBy(parameter: string, value: string) {
    return await this.personRepository.findAdminBy(parameter, value);
  }

  async updatePatient(body: IUpdatePatientById) {
    const infoPersonToUpdate = { ...body, updateDate: new Date() };
    delete infoPersonToUpdate.address;
    delete infoPersonToUpdate.personId;
    delete infoPersonToUpdate.patientId;

    const infoAddressToUpdate = { ...body.address, updateDate: new Date() };
    delete infoAddressToUpdate.ownerAddressId;
    delete infoAddressToUpdate.ownerEmail;
    delete infoAddressToUpdate.ownerName;
    delete infoAddressToUpdate.ownerPhone;
    delete infoAddressToUpdate.addressId;

    await this.personRepository.update(
      String(body.personId),
      infoPersonToUpdate,
    );

    await this.addressRepository.update(
      body.address.addressId,
      infoAddressToUpdate,
    );
  }

  async updateDoctor(body: IUpdateDoctorDto) {
    const infoPersonToUpdate = { ...body, updateDate: new Date() };
    const infoDoctorToUpdate = {
      crm: body.crm,
      updateDate: new Date(),
      councilUf: body.councilUf,
      councilType: body.councilType,
    };
    const infoDoctorSpeciliatyToUpdate = body.doctorSpecialty.filter(
      (speciality: IDoctorSpecialityDto | ICreateDoctorSpecialtiesDto) =>
        speciality.hasOwnProperty('id'),
    );
    const newSpecialities = body.doctorSpecialty.filter(
      (speciality: IDoctorSpecialityDto | ICreateDoctorSpecialtiesDto) =>
        !speciality.hasOwnProperty('id'),
    );

    delete infoPersonToUpdate.address;
    delete infoPersonToUpdate.personId;
    delete infoPersonToUpdate.doctorId;
    delete infoPersonToUpdate.crm;
    delete infoPersonToUpdate.doctorSpecialty;
    delete infoPersonToUpdate.councilUf;
    delete infoPersonToUpdate.councilType;
    delete infoPersonToUpdate.doctorSpecialty;

    const infoAddressToUpdate = { ...body.address, updateDate: new Date() };
    delete infoAddressToUpdate.addressId;

    const infoOwnerAddressToUpdate = {
      ownerEmail: infoAddressToUpdate.ownerEmail,
      ownerName: infoAddressToUpdate.ownerName,
      ownerPhone: infoAddressToUpdate.ownerPhone,
      ownerPhone2: '',
      updateDate: new Date(),
    };

    delete infoAddressToUpdate.ownerAddressId;
    delete infoAddressToUpdate.ownerEmail;
    delete infoAddressToUpdate.ownerName;
    delete infoAddressToUpdate.ownerPhone;

    const savedSpeciliaty = await this.doctorSpeciality.getByDoctorId(
      body.doctorId,
    );
    const removedSpecialities: IDoctorSpecialityDto[] = [];

    savedSpeciliaty.forEach((speciality: IDoctorSpecialityDto) => {
      const thisSpecialityAlreadExist = infoDoctorSpeciliatyToUpdate.find(
        (specialityToUpdate: IDoctorSpecialityDto) =>
          specialityToUpdate.id === speciality.id,
      );
      if (!thisSpecialityAlreadExist) {
        removedSpecialities.push(speciality);
      }
    });

    for (const specilaity of newSpecialities) {
      await this.doctorSpeciality.create({
        idDoctor: body.doctorId,
        registrationNumber: specilaity.registrationNumber,
        specialty: specilaity.specialty,
      });
    }

    for (const specilaity of removedSpecialities) {
      await this.doctorSpeciality.deleteById(specilaity.id);
    }

    await this.personRepository.update(
      String(body.personId),
      infoPersonToUpdate,
    );
    if (Object.keys(infoAddressToUpdate).length) {
      await this.addressRepository.update(
        body.address.addressId,
        infoAddressToUpdate,
      );
    }
    if (Object.keys(infoOwnerAddressToUpdate).length) {
      await this.ownerAddressRepository.update(
        body.address.ownerAddressId,
        infoOwnerAddressToUpdate,
      );
    }

    await this.doctorRepository.update(body.doctorId, infoDoctorToUpdate);

    for (const speciality of infoDoctorSpeciliatyToUpdate) {
      delete speciality.createDate;
      delete speciality.idDoctor;
      speciality.updateDate = new Date();
      await this.doctorSpeciality.update(speciality.id, speciality);
    }
  }

  async updateAdmin(idAdmin: number, body: IUpdateAdminDto) {
    return await this.personRepository.update(String(idAdmin), body);
  }

  async patchPerson(body: IPatchPatientDto, patientId: string) {
    return await this.personRepository.updateCPF(patientId, {
      cpf: body.cpf,
      name: body.name,
    });
  }

  async deleteById(personId: number) {
    const [doctor] = await this.doctorRepository.findBy(
      'idPerson',
      String(personId),
    );

    await this.doctorSpeciality.delete(doctor?.id);
    await this.doctorRepository.delete(doctor?.id);
    await this.personRepository.delete(personId);
  }

  async deleteAdminById(personId: number) {
    await this.personRepository.delete(personId);
  }

  async disablePerson(id: number) {
    await this.personRepository.disable(id);
  }

  async enablePerson(id: number) {
    await this.personRepository.enable(id);
  }

  async searchDoctorByCPFOrName(value: string) {
    const resultByName = await this.personRepository.listDoctorByCPFAndName(
      'name',
      value,
    );
    const resultByCPF = await this.personRepository.listDoctorByCPFAndName(
      'cpf',
      value,
    );
    if (resultByCPF.length) {
      return resultByCPF;
    } else {
      return resultByName;
    }
  }

  async latestDoctors(): Promise<Person[]> {
    return await this.personRepository.listLatestDoctor();
  }

  async getUserNameByEmail(email: string) {
    return await this.personRepository.findByEmail(email);
  }

  async getAdminByCPFOrName(element: string) {
    const listAdmin = await this.personRepository.listAdminByCpfName(element);

    return listAdmin;
  }

  async getPersonEmail(email: string) {
    try {
      const person = await this.personRepository.findLoginByEmail(email.trim());

      if (!person) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (!person?.active) {
        throw new ForbiddenException('Usuário aguardando aprovação');
      }

      const result: IPersonDto = {
        ...person,
      };
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id: number, newPasswordPlainText: string) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPasswordPlainText, salt);
    await this.personRepository.updatePassword(id, hashedPassword);
  }

  async getInfoForAdmin(cpf: string) {
    return await this.personRepository.findByCPF(cpf);
  }
}
