import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropUserAddressJsonb1786722800000 implements MigrationInterface {
  name = 'DropUserAddressJsonb1786722800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "address" jsonb`);
  }
}
