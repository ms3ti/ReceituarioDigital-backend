import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { Doctor } from './doctor.entity';

@Entity()
export class DoctorSpecialties extends BaseEntity {
  @Column()
  idDoctor: number;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @ManyToOne((type) => Doctor, (doctor) => doctor.doctorSpecialties)
  @JoinColumn({ name: 'idDoctor' })
  doctor: Doctor;
}
