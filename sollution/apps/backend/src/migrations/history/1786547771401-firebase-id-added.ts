import { MigrationInterface, QueryRunner } from "typeorm";

export class FirebaseIdAdded1786547771401 implements MigrationInterface {
    name = 'FirebaseIdAdded1786547771401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "firebase_uid" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_40fe3048b17f675b652c1999270" UNIQUE ("firebase_uid")`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_40fe3048b17f675b652c1999270"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firebase_uid"`);
    }

}
