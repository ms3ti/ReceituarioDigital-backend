import { EntityManager, Like, Repository } from 'typeorm';
import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { PrescriptionTypeEnum } from '../../../../../shared/enum/prescription.type.enum';
import { PrescriptionModel } from '../entities/prescriptionModel.entity';
import { DocumentTypeEnum } from 'src/shared/enum/document.type.enum';
import { IUpdatePrescriptionModelDto } from '../../../contracts/dtos/update.prescription.model.dto';

@Injectable()
class PrescriptionModelRepository {
  private ormRepository: Repository<PrescriptionModel>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(PrescriptionModel);
  }

  public async create(
    doctorId: number,
    idPrescriptionTypeId: PrescriptionTypeEnum,
    documentTypeId: DocumentTypeEnum,
    title: string,
    hour: string,
    date: string,
  ): Promise<PrescriptionModel> {
    const createdPrescription = this.ormRepository.create({
      createDate: new Date(),
      doctorId,
      active: true,
      idPrescriptionType: idPrescriptionTypeId,
      documentTypeId,
      title,
      date,
      hour,
    });
    return await this.ormRepository.save(createdPrescription);
  }

  public async listByDoctorId(
    documentTypeId: number,
    prescriptionTitle: string,
    doctorId: number,
  ) {
    const result = await this.ormRepository.findBy({
      doctorId,
      documentTypeId,
      title: Like(`%${prescriptionTitle}%`),
    });

    return result;
  }

  public async delete(prescriptionModelId: number) {
    const result = await this.ormRepository.findOne({
      where: { id: prescriptionModelId },
    });

    if (!result) {
      throw new BadRequestException({
        title: 'Composição da Prescrição não encontrada!',
        message: HttpStatus.NOT_FOUND,
      });
    }

    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('prescription_model')
      .where('id = :id', {
        id: prescriptionModelId,
      })
      .execute();
  }

  async getById(prescriptionModelId: number): Promise<PrescriptionModel> {
    const result = await this.ormRepository.findOne({
      where: { id: prescriptionModelId },
    });

    if (!result) {
      throw new BadRequestException({
        title: 'Documento não encontrado',
        message: HttpStatus.NOT_FOUND,
      });
    }

    return result;
  }

  async update(infoPrescritionToUpdate: IUpdatePrescriptionModelDto) {
    return await this.ormRepository.update(
      infoPrescritionToUpdate.id,
      infoPrescritionToUpdate,
    );
  }
}

export { PrescriptionModelRepository };
