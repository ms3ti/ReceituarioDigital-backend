import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IPrescriptionCompositionRepository } from '../../../contracts/repositories/prescriptionComposition.repository';
import { ICreatePrescriptionCompositionDto } from '../../../contracts/dtos/create.prescription.composition.dto';
import { PrescriptionComposition } from '../entities/prescriptionComposition.entity';
import { IUpdatePrescriptionCompositionDto } from 'src/modules/prescription/contracts/dtos/update.prescription.composition.dto';
import { IPrescriptionCompositionDto } from '../../../contracts/dtos/prescription.composition.dto';

@Injectable()
class PrescriptionCompositionRepository
  implements IPrescriptionCompositionRepository
{
  private ormRepository: Repository<PrescriptionComposition>;

  constructor(manager: EntityManager) {
    this.ormRepository = manager.getRepository(PrescriptionComposition);
  }

  public async create(
    prescription: ICreatePrescriptionCompositionDto,
    prescriptionId: number,
  ): Promise<PrescriptionComposition> {
    const createdPrescriptionComposition = this.ormRepository.create({
      prescriptionId: prescriptionId,
      active: true,
      activePrinciple: prescription.activePrinciple,
      createDate: new Date(),
      description: prescription.description,
      dosage: prescription.dosage,
      isOrientation: prescription.isOrientation,
      medicine: prescription.medicine,
      packing: prescription.packing,
      updateDate: new Date(),
      isContent: prescription.isContent,
      isTitle: prescription.isTitle,
      isJustification: prescription.isJustification,
      examId: prescription.examId,
      medicineId: prescription.medicineId,
      quantity: prescription.quantity,
    });

    return await this.ormRepository.save(createdPrescriptionComposition);
  }

  public async update(id: string, body: IUpdatePrescriptionCompositionDto) {
    delete body.prescriptionCompositionId;
    type UpdatePesonDtoWithoutId = Omit<
      IUpdatePrescriptionCompositionDto,
      'prescriptionCompositionId'
    >;
    const bodyWithoutId: UpdatePesonDtoWithoutId = body;
    bodyWithoutId.updateDate = new Date();
    return await this.ormRepository.update(id, bodyWithoutId);
  }

  async findBy(
    parameter: string,
    value: string,
  ): Promise<IPrescriptionCompositionDto[]> {
    return await this.ormRepository.find({ where: { [parameter]: value } });
  }

  async delete(id: number) {
    await this.ormRepository.delete(id);
  }

  async findAnimalPrescription(
    animal: string,
    doctorId: number,
    totalPerPage: number,
    skip: number,
  ) {
    const prescriptionComposition = await this.ormRepository
      .createQueryBuilder('prescription_composition')
      .innerJoin('prescription', 'prescription.doctorId = ' + doctorId)
      .where('prescription_composition.description like :description', {
        description: `%${animal}%`,
      })
      .orderBy('prescription_composition.createDate', 'DESC')
      .take(totalPerPage)
      .skip(skip)
      .getMany();
    return prescriptionComposition;
  }

  async findAnimalPrescriptionAndPatient(
    animal: string,
    doctorId: number,
    total: number,
    skip: number,
    patientName: string,
  ) {
    const prescriptionComposition = await this.ormRepository.query(
      `
      SELECT
        *
      FROM
        prescription p
        INNER JOIN prescription_composition pc ON pc.prescriptionId = p.id
        INNER JOIN patient pa ON pa.id = p.patientId
        INNER JOIN person pe ON pe.id = pa.idPerson
      WHERE
        pc.description LIKE '%${animal}%' AND p.doctorId = ${doctorId} AND pe.name LIKE '%${patientName}%'
      ORDER BY p.createDate DESC
      LIMIT ${total}
      OFFSET ${skip}
    `,
    );
    return prescriptionComposition;
  }
}

export { PrescriptionCompositionRepository };
