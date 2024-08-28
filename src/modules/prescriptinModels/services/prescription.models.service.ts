import { Injectable } from '@nestjs/common';
import { ICreatePrescriptionModelDto } from '../contracts/dtos/create.prescription.model.dto';
import { IPrescriptionModelDto } from '../contracts/dtos/prescription.model.dto';
import { IUpdatePrescriptionModelDto } from '../contracts/dtos/update.prescription.model.dto';
import { PrescriptionCompositionModelRepository } from '../infra/domain/repositories/prescription.composition.model.repository';
import { PrescriptionModelRepository } from '../infra/domain/repositories/prescription.model.repository';

@Injectable()
export class PrescriptionModelService {
  constructor(
    private readonly prescriptionModelRepository: PrescriptionModelRepository,
    private readonly prescriptionModeloCompositionRepository: PrescriptionCompositionModelRepository,
  ) {}

  async create(
    body: ICreatePrescriptionModelDto,
  ): Promise<IPrescriptionModelDto> {
    const result = await this.prescriptionModelRepository.create(
      body.doctorId,
      body.prescriptionType,
      body.documentTypeId,
      body.title,
      body.hour,
      body.date,
    );
    const resultPCM = [];
    for (const prescriptionCompositionModel of body.prescriptionComposition) {
      const recorded =
        await this.prescriptionModeloCompositionRepository.create(
          prescriptionCompositionModel,
          result.id,
        );

      resultPCM.push(recorded);
    }

    return {
      ...result,
      prescriptionComposition: resultPCM,
    };
  }

  async list(
    documentTypeId: number,
    prescriptionTitle: string,
    doctorId: number,
  ) {
    const listPrescriptionModel =
      await this.prescriptionModelRepository.listByDoctorId(
        documentTypeId,
        prescriptionTitle,
        doctorId,
      );

    for (const prescriptionModel of listPrescriptionModel) {
      const prescriptionModelComposotion =
        await this.prescriptionModeloCompositionRepository.findByPrescriptionModelId(
          prescriptionModel.id,
        );
      prescriptionModel.prescriptionCompositonsModels =
        prescriptionModelComposotion;
    }

    return listPrescriptionModel;
  }

  async deletePrescriptionModel(prescriptionId: number) {
    await this.prescriptionModeloCompositionRepository.deletePrescriptionModelId(
      prescriptionId,
    );
    await this.prescriptionModelRepository.delete(prescriptionId);
  }

  async getById(prescriptionModelId: number): Promise<IPrescriptionModelDto> {
    const [prescriptionModel, prescriptionCompositonsModels] =
      await Promise.all([
        this.prescriptionModelRepository.getById(prescriptionModelId),
        this.prescriptionModeloCompositionRepository.findByPrescriptionModelId(
          prescriptionModelId,
        ),
      ]);
    return {
      ...prescriptionModel,
      prescriptionCompositonsModels,
    };
  }

  async update(prescriptionModel: IUpdatePrescriptionModelDto) {
    const infoPrescritionToUpdate = prescriptionModel;
    const infoCompositionToUpdate =
      prescriptionModel.prescriptionCompositonsModels;
    const prescriptionId = prescriptionModel.id;

    delete infoPrescritionToUpdate.prescriptionCompositonsModels;

    try {
      const prescritionCompositions =
        await this.prescriptionModeloCompositionRepository.findByPrescriptionModelId(
          infoPrescritionToUpdate.id,
        );
      await this.prescriptionModelRepository.update(infoPrescritionToUpdate);

      const idsOfOldComposition = prescritionCompositions.map(
        (oldComposition) => oldComposition.id,
      );

      const prescriptionCompositionAlreadyExits =
        infoCompositionToUpdate.filter((pc) => pc?.hasOwnProperty('id'));

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
        await this.prescriptionModeloCompositionRepository.delete(
          composition.id,
        );
      }

      for (const composition of infoCompositionToUpdate) {
        if (idsOfOldComposition.includes(composition?.id)) {
          await this.prescriptionModeloCompositionRepository.update(
            String(composition.id),
            composition,
          );
        } else {
          await this.prescriptionModeloCompositionRepository.create(
            composition,
            prescriptionId,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
