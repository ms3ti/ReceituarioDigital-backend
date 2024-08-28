import {
  Injectable,
  BadRequestException,
  Logger,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PersonTypeEnum } from '../../../shared/enum/person.type.enum';
import { ICreatePatientDto } from '../contracts/dtos/patient/create.patient.dto';
import { PatientRepository } from '../infra/domain/repositories/patient.repository';
import { Person } from '../../person/infra/domain/entities/person.entity';
import { PersonRepository } from '../../person/infra/domain/repositories/person.repository';
import { IGetPatientByIdDto } from '../contracts/dtos/patient/get.patient.dto';
import { AddressRepository } from '../../address/domain/repositories/address.repository';
import { OwnerAddressRepository } from '../../address/domain/repositories/owner.address.repository';
import { IListPatientDto } from '../contracts/dtos/patient/list.patient.dto';

@Injectable()
export class PatientService {
  private readonly logger = new Logger();
  constructor(
    public readonly personRepository: PersonRepository,
    public readonly addressRepository: AddressRepository,
    public readonly patientRepository: PatientRepository,
    public readonly ownerAddressRepository: OwnerAddressRepository,
  ) {
    this.personRepository = personRepository;
    this.addressRepository = addressRepository;
    this.patientRepository = patientRepository;
    this.ownerAddressRepository = ownerAddressRepository;
  }
  async getPatientByCPF(idDoctor: number, element: string) {
    const listPerson = await this.personRepository.listByCpfName(
      idDoctor,
      element,
    );

    const result = {
      listPerson,
    };

    return result;
  }

  async createPatient(patient: ICreatePatientDto): Promise<Person> {
    if (patient?.cpf.length > 0) {
      const existPerson = await this.personRepository.findByCPF(patient?.cpf);
      if (existPerson) {
        const patientWithSameDoctor =
          await this.patientRepository.findByPersonIdAndDoctorId(
            existPerson?.id,
            patient.idDoctor,
          );
        if (patientWithSameDoctor.length) {
          throw new BadRequestException({
            title: 'Já existe um paciente com este CPF!',
            message: HttpStatus.CONFLICT,
          });
        }
      }
    }

    patient.personType = PersonTypeEnum.PATIENT;
    const newPerson = await this.personRepository.create(patient);
    const newAddress = await this.addressRepository.create(patient.address);
    const newPatient = await this.patientRepository.create(
      newPerson.id,
      patient.idDoctor,
    );

    await this.ownerAddressRepository.create({
      idAddress: newAddress.id,
      idPerson: newPerson.id,
      isDefault: true,
      ownerEmail: '',
      ownerName: '',
      ownerPhone: '',
    });

    const result = {
      address: newAddress,
      patientId: newPatient.id,
      personId: newPerson.id,
      ...newPerson,
    };
    return result;
  }

  async listByDoctor(
    idDoctor: number,
    query: string,
  ): Promise<IListPatientDto[]> {
    const patientResult = await this.patientRepository.findBy(
      'idDoctor',
      idDoctor,
      true,
    );
    const result: IListPatientDto[] = [];

    query = !query ? '' : query;

    for (const patient of patientResult) {
      const [personResultName] =
        await this.personRepository.findByIdAndNameOrCPF(
          'id',
          String(patient.idPerson),
          'name',
          query,
        );

      const [personResultCPF] =
        await this.personRepository.findByIdAndNameOrCPF(
          'id',
          String(patient.idPerson),
          'cpf',
          query,
        );

      const resultPatient = personResultName
        ? personResultName
        : personResultCPF;
      const ownerAddressResult =
        await this.ownerAddressRepository.findByPersonId(resultPatient?.id);
      const addressResult = await this.addressRepository.getById(
        ownerAddressResult?.idAdress,
      );

      if (resultPatient) {
        result.push({
          ...resultPatient,
          patientId: patient.id,
          address: {
            ...ownerAddressResult,
            ...addressResult,
          },
        });
      }
    }

    return result;
  }

  async getPatientById(id: string): Promise<IGetPatientByIdDto> {
    const [patientResult] = await this.patientRepository.findBy(
      'id',
      Number(id),
    );

    const [personResult] = await this.personRepository.findById(
      patientResult.idPerson,
    );

    const ownerAddress = await this.ownerAddressRepository.findByPersonId(
      Number(personResult.id),
      true,
    );

    const address = await this.addressRepository.getById(ownerAddress.idAdress);

    const result: IGetPatientByIdDto = {
      id: patientResult.id,
      birthDate: personResult.birthDate,
      cpf: personResult.cpf,
      email: personResult.email,
      mothersName: personResult.mothersName,
      name: personResult.name,
      personType: personResult.personType,
      phoneNumber: personResult.phoneNumber,
      socialName: personResult.socialName,
      personId: personResult.id,
      patientId: patientResult.id,
      sex: personResult.sex,
      active: personResult.active,
      createDate: personResult.createDate,
      updateDate: personResult.updateDate,
      responsibleCPF: personResult.responsibleCPF,
      responsibleName: personResult.responsibleName,
      responsibleSocialName: personResult.responsibleSocialName,
      hasResponsible: personResult.hasResponsible,
      responsibleBirthDate: personResult.responsibleBirthDate,
      responsibleMothersName: personResult.responsibleMothersName,
      responsibleSex: personResult.responsibleSex,
      address: {
        addressId: address.id,
        ownerAddressId: ownerAddress.id,
        cep: address.cep,
        city: address.city,
        complement: address.complement,
        district: address.district,
        number: address.number,
        ownerEmail: ownerAddress.ownerEmail,
        ownerName: ownerAddress.ownerName,
        ownerPhone: ownerAddress.ownerPhone,
        state: address.state,
        street: address.street,
      },
    };
    return result;
  }

  async disablePatient(patientId: string) {
    const [patient] = await this.patientRepository.findBy(
      'id',
      Number(patientId),
    );
    await Promise.all([
      await this.patientRepository.disable(patientId),
      await this.personRepository.disable(patient.idPerson),
    ]);
  }

  async verifyCPFExistsInThisDoctor(cpf: string, doctorId: number) {
    const patientAlredyExitsForThisDoctor =
      await this.personRepository.findPatientByCPFAndDoctorId(cpf, doctorId);
    return patientAlredyExitsForThisDoctor;
  }

  async findPatientByCPF(cpf: string, doctorId: number) {
    const person = await this.personRepository.findByCPFAnyDoctor(cpf);
    if (!person) {
      throw new NotFoundException({
        title: 'Não existe nenhum paciente com esse CPF!',
        message: HttpStatus.NOT_FOUND,
      });
    }
    const patientAlredyExitsForThisDoctor =
      await this.personRepository.findPatientByCPFAndDoctorId(cpf, doctorId);
    if (patientAlredyExitsForThisDoctor) {
      throw new ConflictException({
        title: 'Você já cadastrou esse paciente',
        message: HttpStatus.CONFLICT,
      });
    }

    const patient = await this.patientRepository.findByPersonId(person.id);

    const ownerAddress = await this.ownerAddressRepository.findByPersonId(
      Number(person.id),
      true,
    );

    const address = await this.addressRepository.getById(ownerAddress.idAdress);

    const result: IGetPatientByIdDto = {
      active: person.active,
      createDate: person.createDate,
      id: patient.id,
      updateDate: person.updateDate,
      birthDate: person.birthDate,
      cpf: person.cpf,
      email: person.email,
      mothersName: person.mothersName,
      name: person.name,
      personType: person.personType,
      phoneNumber: person.phoneNumber,
      socialName: person.socialName,
      personId: person.id,
      patientId: patient.id,
      sex: person.sex,
      responsibleSocialName: person.responsibleSocialName,
      responsibleName: person.responsibleName,
      responsibleCPF: person.responsibleCPF,
      hasResponsible: person.hasResponsible,
      address: {
        addressId: address.id,
        ownerAddressId: ownerAddress.id,
        cep: address.cep,
        city: address.city,
        complement: address.complement,
        district: address.district,
        number: address.number,
        ownerEmail: ownerAddress.ownerEmail,
        ownerName: ownerAddress.ownerName,
        ownerPhone: ownerAddress.ownerPhone,
        state: address.state,
        street: address.street,
      },
    };
    return result;
  }
}
