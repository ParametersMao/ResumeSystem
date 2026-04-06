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
exports.SystemLogsController = void 0;
const common_1 = require("@nestjs/common");
const system_logs_service_1 = require("./system-logs.service");
let SystemLogsController = class SystemLogsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(page, limit, userId, route, method) {
        const data = await this.service.findAll({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            userId: userId ? Number(userId) : undefined,
            route: route || undefined,
            method: method || undefined,
        });
        return {
            code: 200,
            message: 'success',
            data,
        };
    }
};
exports.SystemLogsController = SystemLogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('route')),
    __param(4, (0, common_1.Query)('method')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SystemLogsController.prototype, "list", null);
exports.SystemLogsController = SystemLogsController = __decorate([
    (0, common_1.Controller)('api/system-logs'),
    __metadata("design:paramtypes", [system_logs_service_1.SystemLogsService])
], SystemLogsController);
//# sourceMappingURL=system-logs.controller.js.map