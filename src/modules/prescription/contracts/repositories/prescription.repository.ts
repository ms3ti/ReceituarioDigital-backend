import { PrescriptionTypeEnum } from '../../../../shared/enum/prescription.type.enum';
import { Prescription } from '../../infra/domain/entities/prescription.entity';
import { IUpdatePrescriptionDto } from '../dtos/update.prescrition.dto';

interface IPrescriptionRepository {
  create(
    patientId: number,
    doctorId: number,
    prescriptionType: PrescriptionTypeEnum,
    addressId: number,
    documentTypeId: number,
    date: string,
    hour: string,
    signed: boolean,
    shouldShowDate: boolean,
  ): Promise<Prescription>;

  update(body: IUpdatePrescriptionDto);
}

export { IPrescriptionRepository };
