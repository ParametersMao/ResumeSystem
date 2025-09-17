"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePreviewImageToLongtext1753256747327 = void 0;
class ChangePreviewImageToLongtext1753256747327 {
    name = 'ChangePreviewImageToLongtext1753256747327';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` longtext NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`previewImage\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`previewImage\` text NULL`);
    }
}
exports.ChangePreviewImageToLongtext1753256747327 = ChangePreviewImageToLongtext1753256747327;
//# sourceMappingURL=1753256747327-ChangePreviewImageToLongtext.js.map