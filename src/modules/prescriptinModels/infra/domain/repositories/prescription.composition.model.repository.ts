import { EntityManager, Repository } from 'typeorm';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrescriptionCompositionModel } from '../entities/prescriptionComposition.entity';
import { ICreatePrescriptionCompositionModelDto } from '../../../contracts/dtos/create.prescription.composition.dto';
import { IUpdatePrescriptionCompositionModelDto } from '../../../contracts/dtos/update.prescription.composition.model.dto';

@Injectable()
class PrescriptionCompositionModelRepository {
  private ormRepository: Repository<PrescriptionCompositionModel>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(PrescriptionCompositionModel);
  }

  public async create(
    prescription: ICreatePrescriptionCompositionModelDto,
    prescriptionId: number,
  ): Promise<PrescriptionCompositionModel> {
    const createdPrescriptionComposition = this.ormRepository.create({
      ...prescription,
      prescriptionModelId: prescriptionId,
      createDate: new Date(),
    });
    return await this.ormRepository.save(createdPrescriptionComposition);
  }

  public async findByPrescriptionModelId(prescriptionModelId: number) {
    return await this.ormRepository.findBy({
      prescriptionModelId: prescriptionModelId,
    });
  }

  public async deletePrescriptionModelId(prescriptionModelId: number) {
    const result = await this.ormRepository.find({
      where: { id: prescriptionModelId },
    });

    if (!result) {
      throw new BadRequestException({
        title: 'Prescrição não encontrada!',
        message: HttpStatus.NOT_FOUND,
      });
    }

    await this.ormRepository
      .createQueryBuilder()
      .delete()
      .from('prescription_composition_model')
      .where('prescriptionModelId = :id', {
        id: prescriptionModelId,
      })
      .execute();
  }

  async delete(id: number) {
    return await this.ormRepository.delete(id);
  }

  async update(
    id: string,
    composition: IUpdatePrescriptionCompositionModelDto,
  ) {
    return await this.ormRepository.update(id, composition);
  }
}

export { PrescriptionCompositionModelRepository };
