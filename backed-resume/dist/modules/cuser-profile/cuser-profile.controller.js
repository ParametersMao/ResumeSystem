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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CuserProfileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const cuser_profile_service_1 = require("./cuser-profile.service");
const c_user_profile_dto_1 = require("../../dto/c-user-profile.dto");
function ensureCuser(req) {
    if (!req.user?.id)
        throw new common_1.UnauthorizedException('用户信息无效');
    if (req.user.type !== 'cuser')
        throw new common_1.UnauthorizedException('无权限');
    return req.user.id;
}
let CuserProfileController = class CuserProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getProfile(req) {
        const userId = ensureCuser(req);
        const profile = await this.profileService.getOrCreate(userId);
        return { code: 200, message: 'success', data: profile };
    }
    async updateProfile(req, dto) {
        const userId = ensureCuser(req);
        const profile = await this.profileService.update(userId, dto);
        return { code: 200, message: 'success', data: profile };
    }
    async uploadAvatar(req, file) {
        const userId = ensureCuser(req);
        if (!file) {
            const avatarUrl = '/mock/avatar/default.svg';
            await this.profileService.update(userId, { avatarUrl });
            return { code: 200, message: 'success', data: { avatarUrl } };
        }
        const avatarUrl = `/uploads/avatars/${file.filename}`;
        await this.profileService.update(userId, { avatarUrl });
        return { code: 200, message: 'success', data: { avatarUrl } };
    }
};
exports.CuserProfileController = CuserProfileController;
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CuserProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, c_user_profile_dto_1.UpdateCUserProfileDto]),
    __metadata("design:returntype", Promise)
], CuserProfileController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = (0, path_1.join)(process.cwd(), 'uploads', 'avatars');
                (0, fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: (req, file, cb) => {
                const safeExt = ((0, path_1.extname)(file.originalname || '') || '.png').slice(0, 10);
                const name = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
                cb(null, name);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const ok = /^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.mimetype || '');
            cb(ok ? null : new common_1.BadRequestException('仅支持图片文件'), ok);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CuserProfileController.prototype, "uploadAvatar", null);
exports.CuserProfileController = CuserProfileController = __decorate([
    (0, common_1.Controller)('api/cuser'),
    __metadata("design:paramtypes", [cuser_profile_service_1.CuserProfileService])
], CuserProfileController);
//# sourceMappingURL=cuser-profile.controller.js.map