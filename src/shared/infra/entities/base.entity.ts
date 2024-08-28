import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;
}
