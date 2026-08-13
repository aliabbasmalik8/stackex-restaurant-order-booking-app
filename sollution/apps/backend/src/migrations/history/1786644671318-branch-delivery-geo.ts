import { MigrationInterface, QueryRunner } from "typeorm";

export class BranchDeliveryGeo1786644671318 implements MigrationInterface {
    name = 'BranchDeliveryGeo1786644671318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" ADD "lat" double precision`);
        await queryRunner.query(`ALTER TABLE "branch" ADD "lng" double precision`);
        await queryRunner.query(`ALTER TABLE "branch" ADD "delivery_radius_km" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "delivery_radius_km"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "lng"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP COLUMN "lat"`);
    }

}
