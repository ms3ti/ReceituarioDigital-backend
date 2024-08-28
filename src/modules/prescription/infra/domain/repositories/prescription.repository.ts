import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { PrescriptionTypeEnum } from '../../../../../shared/enum/prescription.type.enum';
import { IUpdatePrescriptionDto } from '../../../contracts/dtos/update.prescrition.dto';
import { IPrescriptionRepository } from '../../../contracts/repositories/prescription.repository';
import { Prescription } from '../entities/prescription.entity';

@Injectable()
class PrescriptionRepository implements IPrescriptionRepository {
  private ormRepository: Repository<Prescription>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(Prescription);
  }

  public async create(
    patientId: number,
    doctorId: number,
    idPrescriptionTypeId: PrescriptionTypeEnum,
    ownerAddressId: number,
    documentTypeId: number,
    date: string,
    hour: string,
    signed: boolean,
    shouldShowDate: boolean,
  ): Promise<Prescription> {
    const createdPrescription = this.ormRepository.create({
      createDate: new Date(),
      patientId: patientId,
      doctorId: doctorId,
      active: true,
      assigned: signed,
      idPrescriptionType: idPrescriptionTypeId,
      ownerAddressId: ownerAddressId,
      documentTypeId: documentTypeId,
      date: date,
      hour: hour,
      updateDate: new Date(),
      shouldShowDate: shouldShowDate,
    });
    return await this.ormRepository.save(createdPrescription);
  }

  public async update(body: IUpdatePrescriptionDto) {
    const id = body.prescriptionId;
    delete body.prescriptionId;
    type UpdatePesonDtoWithoutId = Omit<
      IUpdatePrescriptionDto,
      'prescriptionId'
    >;
    const bodyWithoutId: UpdatePesonDtoWithoutId = body;
    bodyWithoutId.updateDate = new Date();
    await this.ormRepository.update(id, bodyWithoutId);
  }

  async findBy(parameter: string, value: string) {
    return await this.ormRepository.find({ where: { [parameter]: value } });
  }

  public async updateBy(parameter: number, value: object) {
    const property = await this.ormRepository.findOne({
      where: { id: parameter },
    });

    return this.ormRepository.save({
      ...property,
      ...value,
    });
  }

  async findByPagination(doctorId: number, totalPerPage: number, skip: number) {
    const result = await this.ormRepository
      .createQueryBuilder('prescription')
      .where('prescription.doctorId = :doctorId', { doctorId: doctorId })
      .orderBy('prescription.createDate', 'DESC')
      .take(totalPerPage)
      .skip(skip)
      .getManyAndCount();

    return result;
  }

  async findByPaginationByPatient(
    doctorId: number,
    patientId: number,
    totalPerPage: number,
    skip: number,
  ) {
    const result = await this.ormRepository
      .createQueryBuilder('prescription')
      .where('prescription.doctorId = :doctorId', { doctorId: doctorId })
      .andWhere('prescription.patientId =:patientId', { patientId: patientId })
      .orderBy('prescription.createDate', 'DESC')
      .take(totalPerPage)
      .skip(skip)
      .getManyAndCount();

    return result;
  }

  async delete(prescriptionId: number) {
    await this.ormRepository.delete(prescriptionId);
  }

  async saveLink(prescriptionId: number, link: string) {
    await this.ormRepository.update(prescriptionId, {
      link: link,
    });
  }

  async signDocument(prescriptionId: number, status: boolean) {
    await this.ormRepository.update(prescriptionId, {
      assigned: status,
    });
  }

  async saveSignDocument(
    prescriptionId: number,
    idDocument: string,
    linkSigned: string,
  ) {
    await this.ormRepository.update(prescriptionId, {
      idDocument,
      linkSigned,
    });
  }

  async updateDate(prescriptionId: number) {
    await this.ormRepository.update(prescriptionId, {
      updateDate: new Date(),
    });
  }
}

export { PrescriptionRepository };
