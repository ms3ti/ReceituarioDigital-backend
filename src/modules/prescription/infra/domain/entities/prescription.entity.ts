import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { Person } from '../../../../person/infra/domain/entities/person.entity';
import { PrescriptionComposition } from './prescriptionComposition.entity';

@Entity()
export class Prescription extends BaseEntity {
  @Column()
  idPrescriptionType: number;

  @Column()
  assigned: boolean;

  @Column()
  patientId: number;

  @Column()
  doctorId: number;

  @Column()
  ownerAddressId?: number;

  @Column()
  documentTypeId: number;

  @Column()
  date: string;

  @Column()
  hour: string;

  @Column()
  link: string;

  @Column()
  idDocument: string;

  @Column({ default: true })
  shouldShowDate: boolean;

  @Column()
  linkSigned: string;

  @OneToMany(() => PrescriptionComposition, (pc) => pc.prescription)
  prescriptionCompositons: PrescriptionComposition[];

  @OneToMany(() => Person, (person) => person.id)
  person: Person[];
}
