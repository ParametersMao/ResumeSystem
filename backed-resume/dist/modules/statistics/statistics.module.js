"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const statistics_controller_1 = require("./statistics.controller");
const statistics_service_1 = require("./statistics.service");
const statistic_entity_1 = require("../../entities/statistic.entity");
const template_entity_1 = require("../../entities/template.entity");
const c_user_entity_1 = require("../../entities/c-user.entity");
const ai_operation_entity_1 = require("../../entities/ai-operation.entity");
const template_usage_entity_1 = require("../../entities/template-usage.entity");
const resume_download_entity_1 = require("../../entities/resume-download.entity");
let StatisticsModule = class StatisticsModule {
};
exports.StatisticsModule = StatisticsModule;
exports.StatisticsModule = StatisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                statistic_entity_1.Statistic,
                template_entity_1.Template,
                c_user_entity_1.CUser,
                ai_operation_entity_1.AiOperation,
                template_usage_entity_1.TemplateUsage,
                resume_download_entity_1.ResumeDownload,
            ]),
        ],
        controllers: [statistics_controller_1.StatisticsController],
        providers: [statistics_service_1.StatisticsService],
        exports: [statistics_service_1.StatisticsService],
    })
], StatisticsModule);
//# sourceMappingURL=statistics.module.js.map