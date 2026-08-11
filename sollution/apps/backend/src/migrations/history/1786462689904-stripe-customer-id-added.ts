import { MigrationInterface, QueryRunner } from "typeorm";

export class StripeCustomerIdAdded1786462689904 implements MigrationInterface {
    name = 'StripeCustomerIdAdded1786462689904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "stripe_customer_id" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_8053b76f596e6fa3b56582be939" UNIQUE ("stripe_customer_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_8053b76f596e6fa3b56582be939"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "stripe_customer_id"`);
    }

}
