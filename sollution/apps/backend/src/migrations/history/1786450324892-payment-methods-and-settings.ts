import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentMethodsAndSettings1786450324892 implements MigrationInterface {
    name = 'PaymentMethodsAndSettings1786450324892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_setting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0d66bfb0d9f93124a4549d21af0" UNIQUE ("key"), CONSTRAINT "PK_10b1e1bf64917bdb640f8eedb31" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD "payment_method" character varying NOT NULL DEFAULT 'cash'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "payment_status" character varying NOT NULL DEFAULT 'not_required'`);
        await queryRunner.query(`ALTER TABLE "order" ADD "stripe_payment_intent_id" character varying`);
        await queryRunner.query(`ALTER TABLE "order" ADD "paid_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "paid_at"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "stripe_payment_intent_id"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "payment_status"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "payment_method"`);
        await queryRunner.query(`DROP TABLE "app_setting"`);
    }

}
