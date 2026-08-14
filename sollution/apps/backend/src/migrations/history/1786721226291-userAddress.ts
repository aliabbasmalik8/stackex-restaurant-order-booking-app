import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddress1786721226291 implements MigrationInterface {
    name = 'UserAddress1786721226291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "label" character varying NOT NULL, "line1" text NOT NULL, "line2" text NOT NULL DEFAULT '', "area" text NOT NULL DEFAULT '', "city" character varying NOT NULL, "notes" text NOT NULL DEFAULT '', "lat" double precision NOT NULL, "lng" double precision NOT NULL, "is_default" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_302d96673413455481d5ff4022a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_29d6df815a78e4c8291d3cf5e5" ON "user_address" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "user_address_one_default_per_user" ON "user_address" ("user_id") WHERE "is_default" = true`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD CONSTRAINT "FK_29d6df815a78e4c8291d3cf5e53" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_address" DROP CONSTRAINT "FK_29d6df815a78e4c8291d3cf5e53"`);
        await queryRunner.query(`DROP INDEX "public"."user_address_one_default_per_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29d6df815a78e4c8291d3cf5e5"`);
        await queryRunner.query(`DROP TABLE "user_address"`);
    }

}
