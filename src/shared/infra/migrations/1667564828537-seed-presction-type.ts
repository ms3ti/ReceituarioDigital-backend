import { MigrationInterface, QueryRunner } from 'typeorm';
import { PrescriptionType } from '../../../modules/prescription/infra/domain/entities/prescriptionType.entity';

export class seedPresctionType1667564828537 implements MigrationInterface {
  name = 'SeedPresctionType1667564828537';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(
      queryRunner.manager.create<PrescriptionType>(PrescriptionType, {
        description: 'Prescrição',
        active: true,
        createDate: new Date(),
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM PresctionType`);
  }
}
