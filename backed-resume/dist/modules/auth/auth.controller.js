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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const admin_user_dto_1 = require("../../dto/admin-user.dto");
const c_user_dto_1 = require("../../dto/c-user.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        console.log('login called', loginDto);
        const result = await this.authService.login(loginDto);
        return {
            code: 200,
            message: '登录成功',
            data: result,
        };
    }
    async getProfile(req) {
        if (!req.user || !req.user.id) {
            throw new common_1.UnauthorizedException('用户信息无效');
        }
        if (req.user.type !== 'admin') {
            throw new common_1.UnauthorizedException('无权限');
        }
        const profile = await this.authService.getProfile(req.user.id);
        return {
            code: 200,
            message: 'success',
            data: profile,
        };
    }
    async register(createCUserDto) {
        const result = await this.authService.register(createCUserDto);
        return {
            code: 200,
            message: '注册成功',
            data: result,
        };
    }
    async cuserLogin(loginDto) {
        const result = await this.authService.cuserLogin(loginDto);
        return {
            code: 200,
            message: '登录成功',
            data: result,
        };
    }
    async getCuserProfile(req) {
        if (!req.user || !req.user.id) {
            throw new common_1.UnauthorizedException('用户信息无效');
        }
        if (req.user.type !== 'cuser') {
            throw new common_1.UnauthorizedException('无权限');
        }
        const profile = await this.authService.getCuserProfile(req.user.id);
        return {
            code: 200,
            message: 'success',
            data: profile,
        };
    }
    async getCuserCenter(req) {
        if (!req.user || !req.user.id) {
            throw new common_1.UnauthorizedException('用户信息无效');
        }
        if (req.user.type !== 'cuser') {
            throw new common_1.UnauthorizedException('无权限');
        }
        const center = await this.authService.getCuserCenter(req.user.id);
        return {
            code: 200,
            message: 'success',
            data: center,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_user_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [c_user_dto_1.CreateCUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('cuser/login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_user_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cuserLogin", null);
__decorate([
    (0, common_1.Get)('cuser/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCuserProfile", null);
__decorate([
    (0, common_1.Get)('cuser/center'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCuserCenter", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map