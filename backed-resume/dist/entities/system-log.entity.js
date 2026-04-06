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
exports.SystemLog = void 0;
const typeorm_1 = require("typeorm");
let SystemLog = class SystemLog {
    id;
    userId;
    userType;
    route;
    method;
    ip;
    userAgent;
    statusCode;
    durationMs;
    paramsJson;
    createTime;
};
exports.SystemLog = SystemLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SystemLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'user_id', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16, name: 'user_type', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SystemLog.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12 }),
    __metadata("design:type", String)
], SystemLog.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, name: 'user_agent', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'status_code', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'duration_ms', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "durationMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'params_json', nullable: true }),
    __metadata("design:type", Object)
], SystemLog.prototype, "paramsJson", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime', name: 'create_time' }),
    __metadata("design:type", Date)
], SystemLog.prototype, "createTime", void 0);
exports.SystemLog = SystemLog = __decorate([
    (0, typeorm_1.Entity)('system_logs')
], SystemLog);
//# sourceMappingURL=system-log.entity.js.map