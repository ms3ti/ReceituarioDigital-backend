import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { formatToCPFOrCNPJ, formatToPhone } from 'brazilian-values';
import * as path from 'path';
import { ICreateDoctorDto } from 'src/modules/doctor/contracts/dtos/doctor/create.doctor.dto';
import { DoctorRepository } from 'src/modules/doctor/infra/domain/repositories/doctor.repository';
import { DoctorSpecialtyRepository } from 'src/modules/doctor/infra/domain/repositories/doctor.specialties.repository';
import { PersonService } from 'src/modules/person/services/person.service';
import { MailService } from 'src/shared/container/providers/MailProvider/implementations/MailService';
import { PersonTypeEnum } from 'src/shared/enum/person.type.enum';
import { PlanType } from 'src/shared/enum/planType';
import { generateImageURL } from '../../../shared/generateImageUrl';
import { AddressRepository } from '../../address/domain/repositories/address.repository';
import { OwnerAddressRepository } from '../../address/domain/repositories/owner.address.repository';
import { Person } from '../../person/infra/domain/entities/person.entity';
import { PersonRepository } from '../../person/infra/domain/repositories/person.repository';
import { IDoctorDto } from '../contracts/dtos/doctor/doctor.dto';
import { RegionalCouncilIdToName } from './../../../shared/enum/councilType';
import { formatDateddmmyyyy } from './../../../shared/formatDDmmYYYY';
import { differenceInDays, addDays } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DoctorService {
  constructor(
    public readonly personRepository: PersonRepository,
    public readonly addressRepository: AddressRepository,
    public readonly ownerAddressRepository: OwnerAddressRepository,
    public readonly doctorRepository: DoctorRepository,
    public readonly doctorSpecialtyRepository: DoctorSpecialtyRepository,
    public readonly personService: PersonService,
    private readonly mailerService: MailService,
  ) {
    this.personRepository = personRepository;
    this.addressRepository = addressRepository;
    this.doctorRepository = doctorRepository;
    this.ownerAddressRepository = ownerAddressRepository;
    this.doctorSpecialtyRepository = doctorSpecialtyRepository;
    this.personService = personService;
    this.mailerService = mailerService;
  }

  async createDoctor(doctor: ICreateDoctorDto): Promise<Person> {
    const existCPFPerson = await this.personRepository.findDoctorByCPF(
      doctor?.cpf,
    );
    if (existCPFPerson) {
      throw new BadRequestException({
        title: 'Já existe um médico com este CPF!',
        message: HttpStatus.CONFLICT,
      });
    }

    const existEmailPerson = await this.personRepository.findByEmail(
      doctor?.email,
    );
    if (existEmailPerson) {
      throw new BadRequestException({
        title: 'Já existe um usuário com esse e-mail!',
        message: HttpStatus.CONFLICT,
      });
    }

    const salt = await bcrypt.genSalt();
    doctor.password = await bcrypt.hash(doctor.password, salt);

    doctor.personType = PersonTypeEnum.DOCTOR;
    const newPerson = await this.personRepository.create(doctor);
    const newAddress = await this.addressRepository.create(doctor.address);

    const ownerAddressResult = await this.ownerAddressRepository.create({
      idAddress: newAddress.id,
      idPerson: newPerson.id,
      cnpj: doctor.address.cnpj,
      isDefault: doctor.address.isDefault,
      ownerEmail: doctor.address.ownerEmail,
      ownerName: doctor.address.ownerName,
      ownerPhone: doctor.address.ownerPhone,
      ownerPhone2: doctor.address.ownerPhone2,
    });

    const newDoctor = await this.doctorRepository.create(
      newPerson.id,
      String(doctor.crm),
      doctor.councilType,
      doctor.councilUf,
      PlanType.TRAIL,
      addDays(new Date(), 8),
    );

    if (Array.isArray(doctor.doctorSpecialty)) {
      for (const speciality of doctor.doctorSpecialty) {
        await this.doctorSpecialtyRepository.create({
          idDoctor: newDoctor.id,
          specialty: speciality.specialty,
          registrationNumber: speciality.registrationNumber,
        });
      }
    }

    const result = {
      address: {
        ownerAddressId: ownerAddressResult.id,
        ...newAddress,
      },
      doctorId: newDoctor.id,
      ...newPerson,
    };

    const template = path.resolve(
      __dirname,
      '..',
      '..',
      'views',
      'new_account.hbs',
    );

    await this.mailerService.sendMail({
      to: {
        name: 'Admin',
        email: 'oi@meureceituraiodigital.com.br',
      },
      from: {
        name: 'MRD - Meu Receituário Digital',
        email: process.env.EMAIL_USER,
      },
      copy: {
        name: 'Noreplay',
        email: process.env.EMAIL_USER,
      },
      subject: 'MRD - Meu Receituário Digital',
      templateData: {
        file: template,
        variables: {
          personId: newPerson.id,
          name: doctor.name,
          socialName: doctor.socialName,
          cpf: formatToCPFOrCNPJ(doctor.cpf ? doctor.cpf : ''),
          concil: RegionalCouncilIdToName[doctor?.councilType],
          concilUf: doctor?.councilUf,
          birthDate: formatDateddmmyyyy(new Date(doctor.birthDate)),
          sex: doctor.sex,
          email: doctor.email,
          phoneNumber: formatToPhone(
            doctor.phoneNumber ? doctor.phoneNumber : '',
          ),
          ownerName: doctor.address.ownerName,
          cnpj: formatToCPFOrCNPJ(
            doctor.address.cnpj ? doctor.address.cnpj : '',
          ),
          ownerEmail: doctor.address.ownerEmail,
          ownerPhoneNumber: formatToPhone(
            doctor.address?.ownerPhone ? doctor.address?.ownerPhone : '',
          ),
          ownerPhoneNumber2: formatToPhone(
            doctor.address?.ownerPhone2 ? doctor.address?.ownerPhone2 : '',
          ),
          ownerStreet: doctor.address.street,
          ownerNumber: doctor.address.number,
          ownerComplement: doctor.address.complement,
          ownerCity: doctor.address.city,
          ownerCep: doctor.address.cep,
          ownerState: doctor.address.state,
          ownerDistrict: doctor.address.district,
          doctorSpecialty: doctor.doctorSpecialty,
        },
      },
    });
    return result;
  }

  async getDoctorByPersonId(id: number) {
    return await this.doctorRepository.findBy('idPerson', String(id));
  }

  async getDoctorById(id: number): Promise<IDoctorDto> {
    const [doctorResult, doctorSpecialtyResult] = await Promise.all([
      await this.doctorRepository.getById(id),
      await this.doctorSpecialtyRepository.getByDoctorId(id),
    ]);
    const [personResult] = await this.personRepository.findById(
      doctorResult.idPerson,
    );
    const ownerAddressResult = await this.ownerAddressRepository.findByPersonId(
      personResult.id,
    );
    const addressResult = await this.addressRepository.getById(
      ownerAddressResult.idAdress,
    );
    const result: IDoctorDto = {
      birthDate: personResult.birthDate,
      cpf: personResult.cpf,
      email: personResult.email,
      mothersName: personResult.mothersName,
      name: personResult.name,
      personType: personResult.personType,
      phoneNumber: personResult.phoneNumber,
      socialName: personResult.socialName,
      personId: personResult.id,
      crm: doctorResult.crm,
      councilType: doctorResult.councilType,
      councilUf: doctorResult.councilUf,
      plan: doctorResult.plan,
      date_plan: doctorResult.date_plan,
      doctorSpecialty: doctorSpecialtyResult,
      doctorId: doctorResult.id,
      sex: personResult.sex,
      imageUrl: ownerAddressResult.imageName
        ? generateImageURL(
            String(doctorResult.id),
            String(ownerAddressResult.id),
            ownerAddressResult.imageName,
          )
        : null,
      address: {
        ownerAddressId: ownerAddressResult.id,
        addressId: addressResult.id,
        cep: addressResult.cep,
        city: addressResult.city,
        complement: addressResult.complement,
        district: addressResult.district,
        number: addressResult.number,
        ownerEmail: ownerAddressResult.ownerEmail,
        ownerName: ownerAddressResult.ownerName,
        ownerPhone: ownerAddressResult.ownerPhone,
        state: addressResult.state,
        street: addressResult.street,
      },
    };
    return result;
  }

  async updateTrail(id: number, body: { date_plan: Date }) {
    await this.doctorRepository.updateDatePlan(id, body);
  }

  async updatePlan(id: number, plan: { plan: string }) {
    await this.doctorRepository.updatePlan(id, plan);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async getTrailsDoctors() {
    try {
      const result = await this.doctorRepository.list();

      return result.filter(async (d) => {
        if (d.plan === 'trail') {
          if (differenceInDays(new Date(d?.date_plan), new Date()) === 0) {
            await this.personRepository.disable(d?.idPerson);
            await this.doctorRepository.updatePlan(d.id, {
              plan: PlanType.BLOCKED,
            });
          }
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async getDoctorByEmail(email: string): Promise<IDoctorDto> {
    try {
      const person = await this.personRepository.findDoctorByEmail(
        email.trim(),
      );

      if (!person) {
        throw new NotFoundException('Usuário não encontrado');
      }

      if (!person?.active) {
        throw new ForbiddenException('Usuário aguardando aprovação');
      }

      const doctorResult = await this.doctorRepository.findBy(
        'idPerson',
        String(person.id),
      );
      const doctorSpecialtyResult =
        await this.doctorSpecialtyRepository.getByDoctorId(doctorResult[0].id);

      const ownerAddressResult =
        await this.ownerAddressRepository.findByPersonIdIsDefaultTrue(
          person.id,
          true,
        );

      const addressResult = await this.addressRepository.getById(
        ownerAddressResult?.idAdress,
      );
      const result: IDoctorDto = {
        birthDate: person.birthDate,
        cpf: person.cpf,
        email: person.email,
        mothersName: person.mothersName,
        name: person.name,
        personType: person.personType,
        phoneNumber: person.phoneNumber,
        socialName: person.socialName,
        personId: person.id,
        crm: doctorResult[0].crm,
        councilType: doctorResult[0].councilType,
        councilUf: doctorResult[0].councilUf,
        plan: doctorResult[0].plan,
        date_plan: doctorResult[0].date_plan,
        doctorSpecialty: doctorSpecialtyResult,
        doctorId: doctorResult[0].id,
        sex: person.sex,
        imageUrl: ownerAddressResult?.imageName
          ? generateImageURL(
              String(doctorResult[0].id),
              String(ownerAddressResult.id),
              ownerAddressResult.imageName,
            )
          : null,
        address: {
          ownerAddressId: ownerAddressResult.id,
          addressId: addressResult.id,
          cep: addressResult.cep,
          city: addressResult.city,
          complement: addressResult.complement,
          district: addressResult.district,
          number: addressResult.number,
          ownerEmail: ownerAddressResult.ownerEmail,
          ownerName: ownerAddressResult.ownerName,
          ownerPhone: ownerAddressResult.ownerPhone,
          state: addressResult.state,
          street: addressResult.street,
        },
      };
      return result;
    } catch (error) {
      throw error;
    }
  }
}
