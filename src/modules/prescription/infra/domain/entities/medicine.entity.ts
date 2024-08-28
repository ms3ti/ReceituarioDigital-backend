import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class Medicine extends BaseEntity {
  @Column({ length: '900' })
  substance: string;

  @Column()
  product: string;

  @Column()
  presentation: string;

  @Column()
  therapeuticClass: string;

  @Column({ nullable: true })
  class: string;

  @Column()
  accept: boolean;
}
