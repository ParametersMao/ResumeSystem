"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiOperationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_operations_controller_1 = require("./ai-operations.controller");
const ai_operations_service_1 = require("./ai-operations.service");
const ai_operation_entity_1 = require("../../entities/ai-operation.entity");
const c_users_module_1 = require("../c-users/c-users.module");
let AiOperationsModule = class AiOperationsModule {
};
exports.AiOperationsModule = AiOperationsModule;
exports.AiOperationsModule = AiOperationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ai_operation_entity_1.AiOperation]), c_users_module_1.CUsersModule],
        controllers: [ai_operations_controller_1.AiOperationsController],
        providers: [ai_operations_service_1.AiOperationsService],
        exports: [ai_operations_service_1.AiOperationsService],
    })
], AiOperationsModule);
//# sourceMappingURL=ai-operations.module.js.map