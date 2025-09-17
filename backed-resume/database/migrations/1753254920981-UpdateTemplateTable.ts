import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTemplateTable1753254920981 implements MigrationInterface {
    name = 'UpdateTemplateTable1753254920981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`create_time\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`preview_image\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`template_data\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`template_name\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`templateName\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`templateData\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`description\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`status\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`admin_users\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`admin_users\` ADD \`phone\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`admin_users\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`admin_users\` ADD \`phone\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`createTime\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`templateData\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`templateName\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`template_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`template_data\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`preview_image\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`create_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}
