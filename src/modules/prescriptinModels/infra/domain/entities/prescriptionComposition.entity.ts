import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { PrescriptionModel } from './prescriptionModel.entity';

@Entity()
export class PrescriptionCompositionModel extends BaseEntity {
  @Column()
  prescriptionModelId: number;

  @Column()
  description: string;

  @Column({ nullable: true })
  medicine: string;

  @Column({ nullable: true })
  activePrinciple: string;

  @Column({ nullable: true })
  dosage: string;

  @Column({ nullable: true })
  packing: string;

  @ManyToOne(
    (type) => PrescriptionModel,
    (prescription) => prescription.prescriptionCompositonsModels,
  )
  @JoinColumn({ name: 'prescriptionModelId' })
  prescription: PrescriptionModel;

  @Column({ nullable: true })
  isOrientation: boolean;

  @Column({ nullable: true })
  isTitle: boolean;

  @Column({ nullable: true })
  isContent: boolean;

  @Column({ nullable: true })
  isJustification: boolean;

  @Column({ nullable: true })
  examId: number;

  @Column({ nullable: true })
  medicineId: number;

  @Column({ nullable: true, default: true })
  quantity: number;
}
