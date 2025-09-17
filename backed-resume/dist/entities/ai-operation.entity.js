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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiOperation = void 0;
const typeorm_1 = require("typeorm");
const c_user_entity_1 = require("./c-user.entity");
let AiOperation = class AiOperation {
    id;
    userId;
    user;
    operationType;
    inputData;
    outputData;
    createTime;
    tokenUsed;
};
exports.AiOperation = AiOperation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AiOperation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], AiOperation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => c_user_entity_1.CUser),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", c_user_entity_1.CUser)
], AiOperation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, name: 'operation_type' }),
    __metadata("design:type", String)
], AiOperation.prototype, "operationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'input_data' }),
    __metadata("design:type", String)
], AiOperation.prototype, "inputData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'output_data' }),
    __metadata("design:type", String)
], AiOperation.prototype, "outputData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime', name: 'create_time' }),
    __metadata("design:type", Date)
], AiOperation.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'token_used' }),
    __metadata("design:type", Number)
], AiOperation.prototype, "tokenUsed", void 0);
exports.AiOperation = AiOperation = __decorate([
    (0, typeorm_1.Entity)('ai_operations')
], AiOperation);
//# sourceMappingURL=ai-operation.entity.js.map