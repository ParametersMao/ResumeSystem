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
exports.SystemLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const system_log_entity_1 = require("../../entities/system-log.entity");
let SystemLogsService = class SystemLogsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(log) {
        const entity = this.repo.create(log);
        return await this.repo.save(entity);
    }
    async findAll(params) {
        const page = Number.isFinite(params.page) && params.page > 0 ? Math.floor(params.page) : 1;
        const limitRaw = Number.isFinite(params.limit) && params.limit > 0 ? Math.floor(params.limit) : 20;
        const limit = Math.min(limitRaw, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (params.userId)
            where.userId = params.userId;
        if (params.method)
            where.method = params.method.toUpperCase();
        if (params.route)
            where.route = params.route;
        const [list, total] = await this.repo.findAndCount({
            where,
            order: { createTime: 'DESC' },
            skip,
            take: limit,
        });
        return { list, total, page, limit };
    }
};
exports.SystemLogsService = SystemLogsService;
exports.SystemLogsService = SystemLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(system_log_entity_1.SystemLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SystemLogsService);
//# sourceMappingURL=system-logs.service.js.map