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
exports.CUserProfile = void 0;
const typeorm_1 = require("typeorm");
const c_user_entity_1 = require("./c-user.entity");
let CUserProfile = class CUserProfile {
    userId;
    user;
    nickname;
    avatarUrl;
    bio;
    createTime;
    updateTime;
};
exports.CUserProfile = CUserProfile;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'int', name: 'user_id' }),
    __metadata("design:type", Number)
], CUserProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => c_user_entity_1.CUser, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", c_user_entity_1.CUser)
], CUserProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], CUserProfile.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, nullable: true, name: 'avatar_url' }),
    __metadata("design:type", Object)
], CUserProfile.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", Object)
], CUserProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime', name: 'create_time' }),
    __metadata("design:type", Date)
], CUserProfile.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime', name: 'update_time' }),
    __metadata("design:type", Date)
], CUserProfile.prototype, "updateTime", void 0);
exports.CUserProfile = CUserProfile = __decorate([
    (0, typeorm_1.Entity)('c_user_profiles')
], CUserProfile);
//# sourceMappingURL=c-user-profile.entity.js.map