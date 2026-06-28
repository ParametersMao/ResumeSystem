import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePreviewImageColumnType1753255877061 implements MigrationInterface {
    name = 'UpdatePreviewImageColumnType1753255877061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` varchar(255) NULL`);
    }

}
