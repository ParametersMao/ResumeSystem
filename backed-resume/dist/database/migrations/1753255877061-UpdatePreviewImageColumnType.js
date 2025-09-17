"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePreviewImageColumnType1753255877061 = void 0;
class UpdatePreviewImageColumnType1753255877061 {
    name = 'UpdatePreviewImageColumnType1753255877061';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` text NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` varchar(255) NULL`);
    }
}
exports.UpdatePreviewImageColumnType1753255877061 = UpdatePreviewImageColumnType1753255877061;
//# sourceMappingURL=1753255877061-UpdatePreviewImageColumnType.js.map