import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class Address extends BaseEntity {
  @Column()
  cep: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  number: string;

  @Column()
  complement: string | undefined;

  @Column({ default: true })
  active: boolean;

  @Column()
  state: string;

  @Column()
  district: string;
}
