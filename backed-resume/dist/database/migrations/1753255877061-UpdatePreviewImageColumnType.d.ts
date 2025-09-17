import { MigrationInterface, QueryRunner } from "typeorm";
export declare class UpdatePreviewImageColumnType1753255877061 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
