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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const admin_users_service_1 = require("../admin-users/admin-users.service");
const c_users_service_1 = require("../c-users/c-users.service");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    adminUsersService;
    cUsersService;
    jwtService;
    constructor(adminUsersService, cUsersService, jwtService) {
        this.adminUsersService = adminUsersService;
        this.cUsersService = cUsersService;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        console.log('validateUser called', username);
        const user = await this.adminUsersService.findByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        console.log('authService.login called', loginDto);
        try {
            const user = await this.validateUser(loginDto.username, loginDto.password);
            if (!user) {
                throw new common_1.UnauthorizedException('用户名或密码错误');
            }
            if (user.status === 0) {
                throw new common_1.UnauthorizedException('用户已被禁用');
            }
            const payload = { username: user.username, sub: user.id, role: user.role };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                },
            };
        }
        catch (e) {
            console.error('login error', e);
            throw e;
        }
    }
    async getProfile(userId) {
        const user = await this.adminUsersService.findOne(userId);
        const { password, ...result } = user;
        return result;
    }
    async register(createCUserDto) {
        try {
            const existingUser = await this.cUsersService.findByUsername(createCUserDto.username);
            if (existingUser) {
                throw new common_1.ConflictException('用户名已存在');
            }
            if (createCUserDto.phone) {
                const existingPhone = await this.cUsersService.findByPhone(createCUserDto.phone);
                if (existingPhone) {
                    throw new common_1.ConflictException('手机号已存在');
                }
            }
            const user = await this.cUsersService.create(createCUserDto);
            const payload = { username: user.username, sub: user.id, type: 'cuser' };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                },
            };
        }
        catch (e) {
            console.error('register error', e);
            throw e;
        }
    }
    async cuserLogin(loginDto) {
        try {
            const user = await this.validateCUser(loginDto.username, loginDto.password);
            if (!user) {
                throw new common_1.UnauthorizedException('用户名或密码错误');
            }
            if (user.status === 0) {
                throw new common_1.UnauthorizedException('用户已被禁用');
            }
            const payload = { username: user.username, sub: user.id, type: 'cuser' };
            return {
                access_token: this.jwtService.sign(payload),
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                },
            };
        }
        catch (e) {
            console.error('cuserLogin error', e);
            throw e;
        }
    }
    async validateCUser(username, password) {
        const user = await this.cUsersService.findByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async getCuserProfile(userId) {
        const user = await this.cUsersService.findOne(userId);
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [admin_users_service_1.AdminUsersService,
        c_users_service_1.CUsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map