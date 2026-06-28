import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePreviewImageToLongtext1753256747327 implements MigrationInterface {
    name = 'ChangePreviewImageToLongtext1753256747327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` text NULL`);
    }

}
