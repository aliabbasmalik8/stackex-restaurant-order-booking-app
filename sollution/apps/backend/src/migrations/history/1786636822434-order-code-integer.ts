import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderCodeInteger1786636822434 implements MigrationInterface {
    name = 'OrderCodeInteger1786636822434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "UQ_3978b8ace86860e3283a839e535"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "order_code"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "order_code" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "UQ_3978b8ace86860e3283a839e535" UNIQUE ("order_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "UQ_3978b8ace86860e3283a839e535"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "order_code"`);
        await queryRunner.query(`ALTER TABLE "order" ADD "order_code" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "UQ_3978b8ace86860e3283a839e535" UNIQUE ("order_code")`);
    }

}
