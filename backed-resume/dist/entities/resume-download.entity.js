"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeDownload = void 0;
const typeorm_1 = require("typeorm");
const c_user_entity_1 = require("./c-user.entity");
const template_entity_1 = require("./template.entity");
let ResumeDownload = class ResumeDownload {
    id;
    user_id;
    user;
    template_id;
    template;
    download_time;
};
exports.ResumeDownload = ResumeDownload;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ResumeDownload.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ResumeDownload.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => c_user_entity_1.CUser),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", c_user_entity_1.CUser)
], ResumeDownload.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ResumeDownload.prototype, "template_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_entity_1.Template),
    (0, typeorm_1.JoinColumn)({ name: 'template_id' }),
    __metadata("design:type", template_entity_1.Template)
], ResumeDownload.prototype, "template", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime' }),
    __metadata("design:type", Date)
], ResumeDownload.prototype, "download_time", void 0);
exports.ResumeDownload = ResumeDownload = __decorate([
    (0, typeorm_1.Entity)('resume_downloads')
], ResumeDownload);
//# sourceMappingURL=resume-download.entity.js.map