import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIsSuperAdmin1775850300000 implements MigrationInterface {
  name = 'AddUserIsSuperAdmin1775850300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "is_super_admin" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN IF EXISTS "is_super_admin"`,
    );
  }
}
