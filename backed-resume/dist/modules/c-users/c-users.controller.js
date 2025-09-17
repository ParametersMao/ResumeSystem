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
exports.CUsersController = void 0;
const common_1 = require("@nestjs/common");
const c_users_service_1 = require("./c-users.service");
const c_user_dto_1 = require("../../dto/c-user.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
let CUsersController = class CUsersController {
    cUsersService;
    constructor(cUsersService) {
        this.cUsersService = cUsersService;
    }
    async findAll(paginationDto) {
        const result = await this.cUsersService.findAll(paginationDto);
        return {
            code: 200,
            message: 'success',
            data: result,
        };
    }
    async create(createCUserDto) {
        const user = await this.cUsersService.create(createCUserDto);
        return {
            code: 200,
            message: '用户创建成功',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                status: user.status,
                createTime: user.createTime,
                updateTime: user.updateTime,
                aiOperationCount: user.aiOperationCount,
            },
        };
    }
    async update(id, updateCUserDto) {
        const user = await this.cUsersService.update(+id, updateCUserDto);
        return {
            code: 200,
            message: '用户更新成功',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                status: user.status,
                createTime: user.createTime,
                updateTime: user.updateTime,
                aiOperationCount: user.aiOperationCount,
            },
        };
    }
    async updateStatus(id, updateStatusDto) {
        const user = await this.cUsersService.updateStatus(+id, updateStatusDto);
        return {
            code: 200,
            message: '状态更新成功',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                status: user.status,
                createTime: user.createTime,
                updateTime: user.updateTime,
                aiOperationCount: user.aiOperationCount,
            },
        };
    }
    async remove(id) {
        await this.cUsersService.remove(+id);
        return {
            code: 200,
            message: '用户删除成功',
            data: null,
        };
    }
};
exports.CUsersController = CUsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], CUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [c_user_dto_1.CreateCUserDto]),
    __metadata("design:returntype", Promise)
], CUsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, c_user_dto_1.UpdateCUserDto]),
    __metadata("design:returntype", Promise)
], CUsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, c_user_dto_1.UpdateCUserStatusDto]),
    __metadata("design:returntype", Promise)
], CUsersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CUsersController.prototype, "remove", null);
exports.CUsersController = CUsersController = __decorate([
    (0, common_1.Controller)('api/cusers'),
    __metadata("design:paramtypes", [c_users_service_1.CUsersService])
], CUsersController);
//# sourceMappingURL=c-users.controller.js.map