import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';
import { Doctor } from '../../../../doctor/infra/domain/entities/doctor.entity';
import { Patient } from '../../../../patient/infra/domain/entities/patient.entity';

@Entity()
export class Person extends BaseEntity {
  @OneToOne(() => Doctor, { cascade: true })
  @OneToOne(() => Patient, { cascade: true })
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Column()
  personType: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  socialName: string;

  @ApiProperty()
  @Column({ nullable: true })
  cpf: string;

  @ApiProperty()
  @Column({ nullable: true })
  approve: boolean;

  @ApiProperty()
  @Column()
  sex: string;

  @ApiProperty()
  @Column()
  phoneNumber: string;

  @ApiProperty()
  @Column()
  email: string;

  @ApiProperty()
  @Column()
  birthDate: Date;

  @ApiProperty()
  @Column()
  mothersName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleSocialName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleCPF?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleSex?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleMothersName?: string;

  @ApiProperty()
  @Column({ nullable: true })
  responsibleBirthDate?: Date;

  @ApiProperty()
  @Column({ default: false })
  hasResponsible: boolean;

  @ApiProperty()
  @Column({ default: true })
  active: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createDate: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @ApiProperty()
  @Column({ nullable: true })
  username?: string;

  @ApiProperty()
  @Column({ nullable: true })
  password?: string;
}
