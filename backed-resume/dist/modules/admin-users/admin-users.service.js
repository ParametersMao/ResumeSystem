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
exports.AdminUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_user_entity_1 = require("../../entities/admin-user.entity");
const bcrypt = require("bcrypt");
let AdminUsersService = class AdminUsersService {
    adminUserRepository;
    constructor(adminUserRepository) {
        this.adminUserRepository = adminUserRepository;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        const [users, total] = await this.adminUserRepository.findAndCount({
            skip,
            take: limit,
            order: { createTime: 'DESC' },
        });
        const responseData = users.map(user => this.mapToResponseDto(user));
        return {
            list: responseData,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        const user = await this.adminUserRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async create(createAdminUserDto) {
        const existingUser = await this.adminUserRepository.findOne({
            where: { username: createAdminUserDto.username }
        });
        if (existingUser) {
            throw new common_1.ConflictException('用户名已存在');
        }
        const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);
        const user = this.adminUserRepository.create({
            username: createAdminUserDto.username,
            password: hashedPassword,
            email: createAdminUserDto.email,
            phone: createAdminUserDto.phone,
            role: createAdminUserDto.role || 'admin',
            status: createAdminUserDto.status ?? 1,
        });
        return this.adminUserRepository.save(user);
    }
    async update(id, updateAdminUserDto) {
        const user = await this.findOne(id);
        if (updateAdminUserDto.username && updateAdminUserDto.username !== user.username) {
            const existingUser = await this.adminUserRepository.findOne({
                where: { username: updateAdminUserDto.username }
            });
            if (existingUser) {
                throw new common_1.ConflictException('用户名已存在');
            }
        }
        if (updateAdminUserDto.password) {
            updateAdminUserDto.password = await bcrypt.hash(updateAdminUserDto.password, 10);
        }
        Object.assign(user, {
            username: updateAdminUserDto.username,
            password: updateAdminUserDto.password,
            email: updateAdminUserDto.email,
            phone: updateAdminUserDto.phone,
            role: updateAdminUserDto.role,
        });
        return this.adminUserRepository.save(user);
    }
    async updateStatus(id, updateStatusDto) {
        const user = await this.findOne(id);
        user.status = updateStatusDto.status;
        return this.adminUserRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.adminUserRepository.remove(user);
    }
    async findByUsername(username) {
        console.log('findByUsername called', username);
        return this.adminUserRepository.findOne({ where: { username } });
    }
    mapToResponseDto(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            createTime: user.createTime,
            updateTime: user.updateTime,
        };
    }
};
exports.AdminUsersService = AdminUsersService;
exports.AdminUsersService = AdminUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_user_entity_1.AdminUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AdminUsersService);
//# sourceMappingURL=admin-users.service.js.map