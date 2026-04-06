"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemLogsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const system_log_entity_1 = require("../../entities/system-log.entity");
const system_logs_controller_1 = require("./system-logs.controller");
const system_logs_service_1 = require("./system-logs.service");
let SystemLogsModule = class SystemLogsModule {
};
exports.SystemLogsModule = SystemLogsModule;
exports.SystemLogsModule = SystemLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([system_log_entity_1.SystemLog])],
        controllers: [system_logs_controller_1.SystemLogsController],
        providers: [system_logs_service_1.SystemLogsService],
        exports: [system_logs_service_1.SystemLogsService],
    })
], SystemLogsModule);
//# sourceMappingURL=system-logs.module.js.map