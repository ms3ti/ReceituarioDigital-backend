import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { DoctorSpecialties } from './doctor.specialties';

@Entity()
export class Doctor extends BaseEntity {
  @Column()
  idPerson: number;

  @Column()
  crm: string;

  @Column()
  councilType: number;

  @Column()
  councilUf: string;

  @Column()
  plan: string;

  @Column({ nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  date_plan: Date;

  @OneToMany(
    () => DoctorSpecialties,
    (doctorSpecialties) => doctorSpecialties.doctor,
  )
  doctorSpecialties: DoctorSpecialties[];
}
