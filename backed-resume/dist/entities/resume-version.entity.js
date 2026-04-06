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
exports.ResumeVersion = void 0;
const typeorm_1 = require("typeorm");
const resume_entity_1 = require("./resume.entity");
let ResumeVersion = class ResumeVersion {
    id;
    resumeId;
    userId;
    sourceVersion;
    content;
    createTime;
    resume;
};
exports.ResumeVersion = ResumeVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ResumeVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'resume_id' }),
    __metadata("design:type", Number)
], ResumeVersion.prototype, "resumeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'user_id' }),
    __metadata("design:type", Number)
], ResumeVersion.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'source_version', default: 0 }),
    __metadata("design:type", Number)
], ResumeVersion.prototype, "sourceVersion", void 0);
__decorate([
    (0, typeorm_1.Column)('longtext'),
    __metadata("design:type", String)
], ResumeVersion.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime', name: 'create_time' }),
    __metadata("design:type", Date)
], ResumeVersion.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => resume_entity_1.Resume, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'resume_id' }),
    __metadata("design:type", resume_entity_1.Resume)
], ResumeVersion.prototype, "resume", void 0);
exports.ResumeVersion = ResumeVersion = __decorate([
    (0, typeorm_1.Entity)('resume_versions')
], ResumeVersion);
//# sourceMappingURL=resume-version.entity.js.map