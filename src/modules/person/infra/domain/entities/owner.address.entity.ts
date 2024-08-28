import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../../../shared/infra/entities/base.entity';

@Entity()
export class OwnerAddress extends BaseEntity {
  @Column()
  idPerson: number;

  @Column()
  idAdress: number;

  @Column({ nullable: true })
  cnpj?: string;

  @Column({ nullable: false })
  isDefault?: boolean;

  @Column({ nullable: true })
  ownerName?: string;

  @Column({ nullable: true })
  ownerPhone?: string;

  @Column({ nullable: true })
  ownerPhone2?: string;

  @Column({ nullable: true })
  ownerEmail?: string;

  @Column({ nullable: true })
  imageName?: string;

  @Column({ default: true })
  active: boolean;
}
