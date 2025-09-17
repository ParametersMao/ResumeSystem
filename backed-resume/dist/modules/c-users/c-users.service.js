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
exports.CUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const c_user_entity_1 = require("../../entities/c-user.entity");
const bcrypt = require("bcrypt");
let CUsersService = class CUsersService {
    cUserRepository;
    constructor(cUserRepository) {
        this.cUserRepository = cUserRepository;
    }
    async findAll(paginationDto) {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        const [users, total] = await this.cUserRepository.findAndCount({
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
        const user = await this.cUserRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('用户不存在');
        }
        return user;
    }
    async create(createCUserDto) {
        const existingUser = await this.cUserRepository.findOne({
            where: { username: createCUserDto.username }
        });
        if (existingUser) {
            throw new common_1.ConflictException('用户名已存在');
        }
        if (createCUserDto.phone) {
            const existingPhone = await this.cUserRepository.findOne({
                where: { phone: createCUserDto.phone }
            });
            if (existingPhone) {
                throw new common_1.ConflictException('手机号已存在');
            }
        }
        const hashedPassword = await bcrypt.hash(createCUserDto.password, 10);
        const user = this.cUserRepository.create({
            username: createCUserDto.username,
            password: hashedPassword,
            email: createCUserDto.email,
            phone: createCUserDto.phone,
            status: createCUserDto.status ?? 1,
        });
        return this.cUserRepository.save(user);
    }
    async update(id, updateCUserDto) {
        const user = await this.findOne(id);
        if (updateCUserDto.username && updateCUserDto.username !== user.username) {
            const existingUser = await this.cUserRepository.findOne({
                where: { username: updateCUserDto.username }
            });
            if (existingUser) {
                throw new common_1.ConflictException('用户名已存在');
            }
        }
        if (updateCUserDto.phone && updateCUserDto.phone !== user.phone) {
            const existingPhone = await this.cUserRepository.findOne({
                where: { phone: updateCUserDto.phone }
            });
            if (existingPhone) {
                throw new common_1.ConflictException('手机号已存在');
            }
        }
        if (updateCUserDto.password) {
            updateCUserDto.password = await bcrypt.hash(updateCUserDto.password, 10);
        }
        Object.assign(user, {
            username: updateCUserDto.username,
            password: updateCUserDto.password,
            email: updateCUserDto.email,
            phone: updateCUserDto.phone,
        });
        return this.cUserRepository.save(user);
    }
    async updateStatus(id, updateStatusDto) {
        const user = await this.findOne(id);
        user.status = updateStatusDto.status;
        return this.cUserRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.cUserRepository.remove(user);
    }
    async findByUsername(username) {
        return this.cUserRepository.findOne({ where: { username } });
    }
    async findByPhone(phone) {
        return this.cUserRepository.findOne({ where: { phone } });
    }
    async incrementAiOperationCount(id) {
        await this.cUserRepository.increment({ id }, 'aiOperationCount', 1);
    }
    mapToResponseDto(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            status: user.status,
            createTime: user.createTime,
            updateTime: user.updateTime,
            aiOperationCount: user.aiOperationCount,
        };
    }
};
exports.CUsersService = CUsersService;
exports.CUsersService = CUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(c_user_entity_1.CUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CUsersService);
//# sourceMappingURL=c-users.service.js.map