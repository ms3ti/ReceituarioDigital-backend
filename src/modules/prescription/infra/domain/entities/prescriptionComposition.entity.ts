import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { IMedicalExamDto } from '../../../contracts/dtos/medical.exam.dto';
import { Prescription } from './prescription.entity';

@Entity()
export class PrescriptionComposition extends BaseEntity {
  @Column()
  prescriptionId: number;

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
    () => Prescription,
    (prescription) => prescription.prescriptionCompositons,
  )
  @JoinColumn({ name: 'prescriptionId' })
  prescription?: Prescription;

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

  @Column({ nullable: true, default: 0 })
  quantity: number;

  exam?: IMedicalExamDto;
}
