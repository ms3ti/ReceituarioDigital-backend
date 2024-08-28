import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { Doctor } from '../../../../doctor/infra/domain/entities/doctor.entity';
import { Person } from '../../../../person/infra/domain/entities/person.entity';
import { Prescription } from '../../../../prescription/infra/domain/entities/prescription.entity';

@Entity()
export class Patient extends BaseEntity {
  @OneToOne(() => Person, () => Patient)
  @Column()
  idPerson: number;

  @OneToOne(() => Doctor)
  @Column()
  idDoctor: number;

  @OneToMany(() => Prescription, (p) => p.id)
  prescription: Prescription;
}
