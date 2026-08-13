import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductDropBranchId1786643323304 implements MigrationInterface {
    name = 'ProductDropBranchId1786643323304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_47ec9f981fac28851de1d6bd8db"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "branch_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "branch_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_47ec9f981fac28851de1d6bd8db" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
