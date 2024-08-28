import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class Term extends BaseEntity {
  @Column({ type: 'mediumtext' })
  termDescripton: string;

  @Column()
  termType: number;
}
