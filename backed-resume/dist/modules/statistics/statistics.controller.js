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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const statistics_service_1 = require("./statistics.service");
let StatisticsController = class StatisticsController {
    statisticsService;
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getOverview() {
        const overview = await this.statisticsService.getOverview();
        return {
            code: 200,
            message: 'success',
            data: overview,
        };
    }
    async getTrend(period = 'day') {
        const trend = await this.statisticsService.getTrendData(period);
        return {
            code: 200,
            message: 'success',
            data: trend,
        };
    }
    async getPopularTemplates() {
        const templates = await this.statisticsService.getPopularTemplates();
        return {
            code: 200,
            message: 'success',
            data: templates,
        };
    }
    async getUserActivity() {
        const users = await this.statisticsService.getUserActivity();
        return {
            code: 200,
            message: 'success',
            data: users,
        };
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getOverview", null);
__decorate([
    (0, common_1.Get)('trend'),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getTrend", null);
__decorate([
    (0, common_1.Get)('popular-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getPopularTemplates", null);
__decorate([
    (0, common_1.Get)('user-activity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getUserActivity", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, common_1.Controller)('api/statistics'),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map