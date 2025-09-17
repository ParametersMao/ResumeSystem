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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const statistic_entity_1 = require("../../entities/statistic.entity");
const template_entity_1 = require("../../entities/template.entity");
const c_user_entity_1 = require("../../entities/c-user.entity");
const ai_operation_entity_1 = require("../../entities/ai-operation.entity");
const template_usage_entity_1 = require("../../entities/template-usage.entity");
const resume_download_entity_1 = require("../../entities/resume-download.entity");
let StatisticsService = class StatisticsService {
    statisticRepository;
    templateRepository;
    cUserRepository;
    aiOperationRepository;
    templateUsageRepository;
    resumeDownloadRepository;
    constructor(statisticRepository, templateRepository, cUserRepository, aiOperationRepository, templateUsageRepository, resumeDownloadRepository) {
        this.statisticRepository = statisticRepository;
        this.templateRepository = templateRepository;
        this.cUserRepository = cUserRepository;
        this.aiOperationRepository = aiOperationRepository;
        this.templateUsageRepository = templateUsageRepository;
        this.resumeDownloadRepository = resumeDownloadRepository;
    }
    async getOverview() {
        const [totalUsers, totalTemplates, totalAiOperations, totalDownloads, totalTemplateUsage] = await Promise.all([
            this.cUserRepository.count(),
            this.templateRepository.count(),
            this.aiOperationRepository.count(),
            this.resumeDownloadRepository.count(),
            this.templateUsageRepository.count(),
        ]);
        return {
            total_users: totalUsers,
            total_templates: totalTemplates,
            total_ai_operations: totalAiOperations,
            total_downloads: totalDownloads,
            total_template_usage: totalTemplateUsage,
        };
    }
    async getTrendData(period = 'day') {
        const now = new Date();
        let startDate;
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
        const [userTrend, aiOperationTrend, downloadTrend] = await Promise.all([
            this.cUserRepository
                .createQueryBuilder('user')
                .select('DATE(user.create_time)', 'date')
                .addSelect('COUNT(*)', 'count')
                .where('user.create_time >= :startDate', { startDate })
                .groupBy('DATE(user.create_time)')
                .orderBy('date', 'ASC')
                .getRawMany(),
            this.aiOperationRepository
                .createQueryBuilder('operation')
                .select('DATE(operation.create_time)', 'date')
                .addSelect('COUNT(*)', 'count')
                .where('operation.create_time >= :startDate', { startDate })
                .groupBy('DATE(operation.create_time)')
                .orderBy('date', 'ASC')
                .getRawMany(),
            this.resumeDownloadRepository
                .createQueryBuilder('download')
                .select('DATE(download.download_time)', 'date')
                .addSelect('COUNT(*)', 'count')
                .where('download.download_time >= :startDate', { startDate })
                .groupBy('DATE(download.download_time)')
                .orderBy('date', 'ASC')
                .getRawMany(),
        ]);
        return {
            user_trend: userTrend,
            ai_operation_trend: aiOperationTrend,
            download_trend: downloadTrend,
        };
    }
    async getPopularTemplates() {
        const templates = await this.templateRepository
            .createQueryBuilder('template')
            .select([
            'template.id',
            'template.template_name',
            'template.use_count',
            'template.download_count',
        ])
            .orderBy('template.use_count', 'DESC')
            .addOrderBy('template.download_count', 'DESC')
            .limit(10)
            .getMany();
        return templates;
    }
    async getUserActivity() {
        const users = await this.cUserRepository
            .createQueryBuilder('user')
            .select([
            'user.id',
            'user.username',
            'user.ai_operation_count',
        ])
            .orderBy('user.ai_operation_count', 'DESC')
            .limit(10)
            .getMany();
        return users;
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(statistic_entity_1.Statistic)),
    __param(1, (0, typeorm_1.InjectRepository)(template_entity_1.Template)),
    __param(2, (0, typeorm_1.InjectRepository)(c_user_entity_1.CUser)),
    __param(3, (0, typeorm_1.InjectRepository)(ai_operation_entity_1.AiOperation)),
    __param(4, (0, typeorm_1.InjectRepository)(template_usage_entity_1.TemplateUsage)),
    __param(5, (0, typeorm_1.InjectRepository)(resume_download_entity_1.ResumeDownload)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map