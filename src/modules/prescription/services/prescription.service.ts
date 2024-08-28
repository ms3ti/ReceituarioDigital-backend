/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { PatientRepository } from 'src/modules/patient/infra/domain/repositories/patient.repository';
import { PersonRepository } from 'src/modules/person/infra/domain/repositories/person.repository';
import { PersonTypeEnum } from '../../../shared/enum/person.type.enum';
import { formatDateyyyyMMdd } from '../../../shared/formatYYYYmmDD';
import { generateImageURL } from '../../../shared/generateImageUrl';
import { AddressRepository } from '../../address/domain/repositories/address.repository';
import { OwnerAddressRepository } from '../../address/domain/repositories/owner.address.repository';
import { DoctorRepository } from '../../doctor/infra/domain/repositories/doctor.repository';
import { DoctorSpecialtyRepository } from '../../doctor/infra/domain/repositories/doctor.specialties.repository';
import { ICreatePrescriptionDto } from '../contracts/dtos/create.prescription.dto';
import { IGetPaginationDto } from '../contracts/dtos/get.pagination.dto';
import { IPrescriptionsOrganizedByDateDto } from '../contracts/dtos/IPrescriptionOrganizedByDate.dto';
import { IMedicalExamDto } from '../contracts/dtos/medical.exam.dto';
import { IPrescriptionFullInfoDto } from '../contracts/dtos/prescription.full.info.dto';
import { IPrescriptionForPrint } from '../contracts/dtos/prescription.print.dto';
import { IUpdatePrescriptionDto } from '../contracts/dtos/update.prescrition.dto';
import { Prescription } from '../infra/domain/entities/prescription.entity';
import { PrescriptionComposition } from '../infra/domain/entities/prescriptionComposition.entity';
import { MedicalExcamRepository } from '../infra/domain/repositories/medical.exam.repository';
import { MedicineRepository } from '../infra/domain/repositories/medicine.repository';
import { PrescriptionRepository } from '../infra/domain/repositories/prescription.repository';
import { PrescriptionCompositionRepository } from '../infra/domain/repositories/prescriptionComposition.repository';
import { S3Service } from './s3.service';
dotenv.config();

@Injectable()
export class PrescriptionService {
  constructor(
    private prescriptionRepository: PrescriptionRepository,
    private prescriptionCompositionRepository: PrescriptionCompositionRepository,
    private patientRepository: PatientRepository,
    private personRepository: PersonRepository,
    private doctorRepository: DoctorRepository,
    private doctorSpecialityRepository: DoctorSpecialtyRepository,
    private addressRepository: AddressRepository,
    private ownerAddressRepository: OwnerAddressRepository,
    private medicalExamRepository: MedicalExcamRepository,
    private medicineRepository: MedicineRepository,
    private s3Service: S3Service,
  ) {
    this.prescriptionRepository = prescriptionRepository;
    this.prescriptionCompositionRepository = prescriptionCompositionRepository;
    this.patientRepository = patientRepository;
    this.personRepository = personRepository;
    this.doctorRepository = doctorRepository;
    this.doctorSpecialityRepository = doctorSpecialityRepository;
    this.addressRepository = addressRepository;
    this.ownerAddressRepository = ownerAddressRepository;
    this.medicalExamRepository = medicalExamRepository;
    this.medicineRepository = medicineRepository;
    this.s3Service = s3Service;
  }

  async create(
    prescription: ICreatePrescriptionDto,
  ): Promise<IPrescriptionFullInfoDto> {
    const doctor = await this.doctorRepository.getById(prescription.doctorId);

    if (!doctor) {
      throw new NotFoundException('Não há profisisonais com este ID.');
    }

    const ownerAddress = await this.ownerAddressRepository.findByPersonId(
      doctor.idPerson,
    );

    if (!ownerAddress) {
      throw new NotFoundException(
        'Não há endereço ativo para este profissional.',
      );
    }

    const createdPrescription = await this.prescriptionRepository.create(
      prescription.patientId,
      prescription.doctorId,
      prescription.prescriptionType,
      ownerAddress.id,
      prescription.documentTypeId,
      prescription.date,
      prescription.hour,
      prescription.signed,
      prescription.shouldShowDate,
    );
    const prescriptionCompositionCreated = [];
    for (const prescriptionComposition of prescription.prescriptionComposition) {
      const result = await this.prescriptionCompositionRepository.create(
        prescriptionComposition,
        createdPrescription.id,
      );
      prescriptionCompositionCreated.push(result);
    }

    return {
      ...createdPrescription,
      prescriptionComposition: prescriptionCompositionCreated,
    };
  }

  async update(prescription: IUpdatePrescriptionDto) {
    const infoPrescritionToUpdate = prescription;
    const infoCompositionToUpdate = prescription.prescriptionComposition;
    const prescriptionId = prescription.prescriptionId;

    delete infoPrescritionToUpdate.prescriptionComposition;
    delete infoPrescritionToUpdate.person;

    try {
      const prescritionCompositions =
        await this.prescriptionCompositionRepository.findBy(
          'prescriptionId',
          String(infoPrescritionToUpdate.prescriptionId),
        );
      await this.prescriptionRepository.update(infoPrescritionToUpdate);

      const idsOfOldComposition = prescritionCompositions.map(
        (oldComposition) => oldComposition.id,
      );

      const prescriptionCompositionAlreadyExits =
        infoCompositionToUpdate.filter((pc) => pc.hasOwnProperty('id'));

      const prescriptionCompositionToDelete = [];

      prescritionCompositions.forEach((pc) => {
        const notDeleteThisComposition =
          prescriptionCompositionAlreadyExits.find(
            (icptu) => icptu.id === pc.id,
          );

        if (!notDeleteThisComposition) {
          prescriptionCompositionToDelete.push(pc);
        }
      });

      for (const composition of prescriptionCompositionToDelete) {
        await this.prescriptionCompositionRepository.delete(composition.id);
      }

      for (const composition of infoCompositionToUpdate) {
        if (idsOfOldComposition.includes(composition.id)) {
          await this.prescriptionCompositionRepository.update(
            String(composition.id),
            composition,
          );
        } else {
          await this.prescriptionCompositionRepository.create(
            composition,
            prescriptionId,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async updateBy(parameter: number, values: object): Promise<any> {
    return this.prescriptionRepository.updateBy(parameter, values);
  }

  async getByPrescritionId(prescriptionId: number): Promise<Prescription> {
    const prescritionList = await this.prescriptionRepository.findBy(
      'id',
      String(prescriptionId),
    );
    const prescriptionComposition =
      await this.prescriptionCompositionRepository.findBy(
        'prescriptionId',
        String(prescriptionId),
      );

    const patient = await this.patientRepository.findByIgnoringActive(
      'id',
      prescritionList[0].patientId,
    );

    const person = await this.personRepository.findBy(
      'id',
      String(patient[0].idPerson),
    );

    const prescription = prescritionList[0];

    prescription.person = person;
    prescription.prescriptionCompositons = prescriptionComposition;

    return { ...prescription };
  }

  async getByPrescritionPagination(
    doctorId: number,
    patientName: string,
    total: number,
    page: number,
    animal: string,
    searchType: 'Tutor' | 'Animal' | 'Ambos',
  ): Promise<[number, IPrescriptionsOrganizedByDateDto]> {
    try {
      let skip = 0;
      if (page > 1) {
        skip = (page - 1) * total;
      }
      let returnDtoList = [];
      let totalRegister = 0;

      if (searchType === 'Tutor') {
        if (patientName != '') {
          const resultData = await this.getPrescritionByPatientName(
            doctorId,
            patientName,
            total,
            skip,
          );
          totalRegister = resultData[0];
          returnDtoList = resultData[1] != null ? resultData[1] : [];
        } else {
          const prescritionList =
            await this.prescriptionRepository.findByPagination(
              doctorId,
              total,
              skip,
            );
          totalRegister = prescritionList[1];

          for (const prescription of prescritionList[0]) {
            const patient = await this.patientRepository.findByAnyActive(
              'id',
              prescription.patientId,
            );

            const personPatient = await this.personRepository.findById(
              patient[0]?.idPerson,
            );

            const paginationDto: IGetPaginationDto = {
              id: prescription.id,
              patientName: personPatient[0]?.name,
              createDate: prescription.createDate,
              assigned: prescription.assigned,
              assignDate: prescription.updateDate,
              documentTypeId: prescription.documentTypeId,
              idPrescriptionType: prescription.idPrescriptionType,
              shouldShowDate: prescription.shouldShowDate,
            };

            returnDtoList.push(paginationDto);
          }
        }
      }

      if (searchType === 'Animal') {
        const prescriptionCompositionAnimals =
          await this.prescriptionCompositionRepository.findAnimalPrescription(
            animal,
            doctorId,
            total,
            skip,
          );
        const uniqueIdOfPrescription: Array<number> = [];

        prescriptionCompositionAnimals.forEach(
          (pc: PrescriptionComposition) => {
            const isAlreadyOnTheList = returnDtoList.find(
              (prescription: IGetPaginationDto) =>
                prescription.id === pc.prescriptionId,
            );
            if (
              !uniqueIdOfPrescription.includes(pc.prescriptionId) &&
              !isAlreadyOnTheList
            ) {
              uniqueIdOfPrescription.push(pc.prescriptionId);
            }
          },
        );

        for (const prescriptionId of uniqueIdOfPrescription) {
          const [prescription] = await this.prescriptionRepository.findBy(
            'id',
            String(prescriptionId),
          );
          const patient = await this.patientRepository.findByAnyActive(
            'id',
            prescription.patientId,
          );

          const personPatient = await this.personRepository.findById(
            patient[0]?.idPerson,
          );

          const paginationDto: IGetPaginationDto = {
            id: prescription.id,
            patientName: personPatient[0]?.name,
            createDate: prescription.createDate,
            assigned: prescription.assigned,
            assignDate: prescription.updateDate,
            documentTypeId: prescription.documentTypeId,
            idPrescriptionType: prescription.idPrescriptionType,
            shouldShowDate: prescription.shouldShowDate,
          };

          returnDtoList.push(paginationDto);
        }
      }

      if (searchType === 'Ambos') {
        const prescriptionCompositionAnimals =
          await this.prescriptionCompositionRepository.findAnimalPrescriptionAndPatient(
            animal,
            doctorId,
            total,
            skip,
            patientName,
          );
        const uniqueIdOfPrescription: Array<number> = [];

        prescriptionCompositionAnimals.forEach(
          (pc: PrescriptionComposition) => {
            const isAlreadyOnTheList = returnDtoList.find(
              (prescription: IGetPaginationDto) =>
                prescription.id === pc.prescriptionId,
            );
            if (
              !uniqueIdOfPrescription.includes(pc.prescriptionId) &&
              !isAlreadyOnTheList
            ) {
              uniqueIdOfPrescription.push(pc.prescriptionId);
            }
          },
        );

        for (const prescriptionId of uniqueIdOfPrescription) {
          const [prescription] = await this.prescriptionRepository.findBy(
            'id',
            String(prescriptionId),
          );
          const patient = await this.patientRepository.findByAnyActive(
            'id',
            prescription.patientId,
          );

          const personPatient = await this.personRepository.findById(
            patient[0]?.idPerson,
          );

          const paginationDto: IGetPaginationDto = {
            id: prescription.id,
            patientName: personPatient[0]?.name,
            createDate: prescription.createDate,
            assigned: prescription.assigned,
            assignDate: prescription.updateDate,
            documentTypeId: prescription.documentTypeId,
            idPrescriptionType: prescription.idPrescriptionType,
            shouldShowDate: prescription.shouldShowDate,
          };

          returnDtoList.push(paginationDto);
        }
      }

      returnDtoList.sort((a: IGetPaginationDto, b: IGetPaginationDto) => {
        return (
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );
      });

      const returnPrescriptionsOrganizedByDate = {};
      returnDtoList.forEach((prescription: IGetPaginationDto) => {
        if (
          !Array.isArray(
            returnPrescriptionsOrganizedByDate[
              formatDateyyyyMMdd(prescription.createDate)
            ],
          )
        ) {
          returnPrescriptionsOrganizedByDate[
            formatDateyyyyMMdd(prescription.createDate)
          ] = [];
          returnPrescriptionsOrganizedByDate[
            formatDateyyyyMMdd(prescription.createDate)
          ].push(prescription);
        } else {
          returnPrescriptionsOrganizedByDate[
            formatDateyyyyMMdd(prescription.createDate)
          ].push(prescription);
        }
      });
      return [totalRegister, returnPrescriptionsOrganizedByDate];
    } catch (error) {
      throw error;
    }
  }

  private async getPrescritionByPatientName(
    doctorId: number,
    patientName: string,
    total,
    skip,
  ): Promise<[number, IGetPaginationDto[]]> {
    try {
      const returnList = [];
      let totaRegisters = 0;

      const personPatientList = await this.personRepository.listByName(
        patientName,
      );

      for (const person of personPatientList) {
        const patient = await this.patientRepository.findByPersonIdAndDoctorId(
          person.id,
          doctorId,
        );

        if (patient.length > 0) {
          const prescriptionList =
            await this.prescriptionRepository.findByPaginationByPatient(
              doctorId,
              patient[0].id,
              total,
              skip,
            );

          totaRegisters = prescriptionList[1];

          for (const prescription of prescriptionList[0]) {
            const paginationDto: IGetPaginationDto = {
              id: prescription.id,
              patientName: person.name,
              createDate: prescription.createDate,
              assigned: prescription.assigned,
              assignDate: prescription.updateDate,
              documentTypeId: prescription.documentTypeId,
              idPrescriptionType: prescription.idPrescriptionType,
              shouldShowDate: prescription.shouldShowDate,
            };
            returnList.push(paginationDto);
          }
        }
      }

      return [totaRegisters, returnList];
    } catch (error) {
      throw error;
    }
  }

  async generateInfoToPrint(
    prescriptionId: number,
  ): Promise<IPrescriptionForPrint> {
    const [prescriptionComposition, [prescription]] = await Promise.all([
      this.prescriptionCompositionRepository.findBy(
        'prescriptionId',
        String(prescriptionId),
      ),
      this.prescriptionRepository.findBy('id', String(prescriptionId)),
    ]);

    const doctor = await this.doctorRepository.getById(prescription?.doctorId);

    const doctorSpeciality =
      await this.doctorSpecialityRepository.getByDoctorId(
        prescription.doctorId,
      );

    const [ownerAddress] = await this.ownerAddressRepository.findByOwnerId(
      String(prescription.ownerAddressId),
    );

    const doctorAddress = await this.addressRepository.getById(
      ownerAddress.idAdress,
    );

    const [patient] = await this.patientRepository.findByIgnoringActive(
      'id',
      prescription.patientId,
    );

    const [doctorPersonInfo] = await this.personRepository.findById(
      doctor.idPerson,
    );

    const patientOwnerAddress =
      await this.ownerAddressRepository.findByPersonId(patient.idPerson);

    const patientAddress = await this.addressRepository.getById(
      patientOwnerAddress.idAdress,
    );

    const [patientPersonInfo] = await this.personRepository.findById(
      patient.idPerson,
    );

    for (const pc of prescriptionComposition) {
      if (pc.examId) {
        pc.exam = await this.getExamByID(pc.examId);
      }
      if (pc.medicineId) {
        pc.medicineDto = await this.getMedicineById(pc.medicineId);
      }
    }

    const prescriptionForPrint: IPrescriptionForPrint = {
      doctor: {
        imageUrl: ownerAddress.imageName
          ? generateImageURL(
              String(doctor.id),
              String(ownerAddress.id),
              ownerAddress.imageName,
            )
          : null,
        doctorId: doctor.id,
        doctorSpecialty: doctorSpeciality,
        personType: PersonTypeEnum.DOCTOR,
        personId: doctorPersonInfo.id,
        ...doctorPersonInfo,
        ...doctor,
        address: {
          addressId: doctorAddress.id,
          ownerAddressId: ownerAddress.id,
          ...doctorAddress,
          ...ownerAddress,
        },
      },
      patientAddress,
      prescription: {
        ...prescription,
        prescriptionCompositons: prescriptionComposition,
        person: patientPersonInfo,
        linkSigned: null,
        idDocument: null,
      },
    };
    return prescriptionForPrint;
  }

  async uploadLogo(file: string, fileName: string) {
    await this.s3Service.upload(
      `logo/${fileName}`,
      Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
      'image/jpeg',
    );
  }

  async deletePrescription(prescriptionId: number) {
    const prescriptionCompositons =
      await this.prescriptionCompositionRepository.findBy(
        'prescriptionId',
        String(prescriptionId),
      );
    for (const pc of prescriptionCompositons) {
      await this.prescriptionCompositionRepository.delete(pc.id);
    }

    await this.prescriptionRepository.delete(prescriptionId);
  }

  async listExams(name: string): Promise<IMedicalExamDto[]> {
    return await this.medicalExamRepository.listByName(name);
  }

  async getExamByID(examId: number): Promise<IMedicalExamDto> {
    return await this.medicalExamRepository.getByID(examId);
  }

  async getMedicineById(medicineId: number) {
    return await this.medicineRepository.getByID(medicineId);
  }

  async listMedicine(name: string) {
    return await this.medicineRepository.listByName(name);
  }

  async saveFile(pdf: {
    buffer: string;
    fileName: string;
    prescriptionType: number;
  }): Promise<string> {
    try {
      const result = await this.s3Service.upload(
        `document/${pdf.fileName}`,
        Buffer.from(pdf.buffer, 'base64'),
        'application/pdf',
      );
      return result.Location;
    } catch (error) {
      console.log(error);
    }
  }

  async saveLink(prescriptionId: number, link: string) {
    await this.prescriptionRepository.saveLink(prescriptionId, link);
  }

  async signDocument(prescriptionId: number, status: boolean) {
    await this.prescriptionRepository.signDocument(prescriptionId, status);
  }

  async saveSignDocument(
    prescriptionId: number,
    idDocument: string,
    linkSigned: string,
  ) {
    await this.prescriptionRepository.saveSignDocument(
      prescriptionId,
      idDocument,
      linkSigned,
    );
  }

  async updateDate(prescriptionId: number) {
    await this.prescriptionRepository.updateDate(prescriptionId);
  }

  async countPrescription(id: number) {
    const result = await this.prescriptionRepository.findBy(
      'doctorId',
      String(id),
    );
    return result.length;
  }
}
