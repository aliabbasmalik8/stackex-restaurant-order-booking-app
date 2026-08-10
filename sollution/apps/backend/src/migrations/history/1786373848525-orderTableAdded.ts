import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderTableAdded1786373848525 implements MigrationInterface {
    name = 'OrderTableAdded1786373848525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_product_category"`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, "name_arabic" character varying NOT NULL, "address" text NOT NULL DEFAULT '', "address_arabic" text NOT NULL DEFAULT '', "eta_minutes" integer NOT NULL DEFAULT '15', "active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e3aa5d12f4e259afa5c1e216568" UNIQUE ("slug"), CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "order_code" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "ready_around" character varying, "branch_id" uuid, "branch_label" character varying NOT NULL, "branch_label_arabic" character varying NOT NULL, "address" text NOT NULL DEFAULT '', "address_arabic" text NOT NULL DEFAULT '', "customer_address" jsonb, "items" jsonb NOT NULL DEFAULT '[]', "subtotal" double precision NOT NULL DEFAULT '0', "vat" double precision NOT NULL DEFAULT '0', "total" double precision NOT NULL DEFAULT '0', "contact" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3978b8ace86860e3283a839e535" UNIQUE ("order_code"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_199e32a02ddc0f47cd93181d8f" ON "order" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "contact_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "address" jsonb`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "branch_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_47ec9f981fac28851de1d6bd8db" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_47ec9f981fac28851de1d6bd8db"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "branch_id"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "branch_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_199e32a02ddc0f47cd93181d8f"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_product_category" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
