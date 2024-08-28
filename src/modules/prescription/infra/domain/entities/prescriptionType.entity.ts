import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class PrescriptionType extends BaseEntity {
  @Column()
  description: string;
}
