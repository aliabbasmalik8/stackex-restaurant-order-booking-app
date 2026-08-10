import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoryAndProduct1775850200000 implements MigrationInterface {
  name = 'CategoryAndProduct1775850200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "label" character varying NOT NULL, "label_arabic" character varying NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_category_slug" UNIQUE ("slug"), CONSTRAINT "PK_category" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "name" character varying NOT NULL, "name_arabic" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "description_arabic" text NOT NULL DEFAULT '', "long_description" text NOT NULL DEFAULT '', "long_description_arabic" text NOT NULL DEFAULT '', "featured_subtitle" text, "featured_subtitle_arabic" text, "price" double precision NOT NULL, "category_id" uuid NOT NULL, "branch_id" character varying NOT NULL, "image" text NOT NULL DEFAULT '', "featured" boolean NOT NULL DEFAULT false, "badge" character varying, "badge_arabic" character varying, "calories" integer, "available" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "modifiers" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_product_slug" UNIQUE ("slug"), CONSTRAINT "PK_product" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_product_category" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_product_category"`,
    );
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TABLE "category"`);
  }
}
