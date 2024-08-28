import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class MedicalExam extends BaseEntity {
  @Column()
  name: string;
}
