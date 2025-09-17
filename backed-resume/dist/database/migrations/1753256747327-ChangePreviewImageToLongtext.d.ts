import { MigrationInterface, QueryRunner } from "typeorm";
export declare class ChangePreviewImageToLongtext1753256747327 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
