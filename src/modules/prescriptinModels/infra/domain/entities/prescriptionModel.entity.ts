import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { Person } from '../../../../person/infra/domain/entities/person.entity';
import { PrescriptionCompositionModel } from './prescriptionComposition.entity';

@Entity()
export class PrescriptionModel extends BaseEntity {
  @Column()
  idPrescriptionType: number;

  @Column()
  doctorId: number;

  @Column()
  title: string;

  @Column()
  documentTypeId: number;

  @OneToMany(() => PrescriptionCompositionModel, (pc) => pc.prescription)
  prescriptionCompositonsModels: PrescriptionCompositionModel[];

  @OneToMany(() => Person, (person) => person.id)
  person: Person[];

  @Column()
  date: string;

  @Column()
  hour: string;
}
