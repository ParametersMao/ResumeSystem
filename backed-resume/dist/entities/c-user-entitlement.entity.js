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
exports.CUserEntitlement = void 0;
const typeorm_1 = require("typeorm");
const c_user_entity_1 = require("./c-user.entity");
let CUserEntitlement = class CUserEntitlement {
    userId;
    user;
    planCode;
    accountWeight;
    aiFreeTotal;
    aiFreeUsed;
    aiFreeResetPolicy;
    expireAt;
    createTime;
    updateTime;
};
exports.CUserEntitlement = CUserEntitlement;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'int', name: 'user_id' }),
    __metadata("design:type", Number)
], CUserEntitlement.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => c_user_entity_1.CUser, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", c_user_entity_1.CUser)
], CUserEntitlement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32, default: 'free', name: 'plan_code' }),
    __metadata("design:type", String)
], CUserEntitlement.prototype, "planCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'account_weight' }),
    __metadata("design:type", Number)
], CUserEntitlement.prototype, "accountWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 20, name: 'ai_free_total' }),
    __metadata("design:type", Number)
], CUserEntitlement.prototype, "aiFreeTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0, name: 'ai_free_used' }),
    __metadata("design:type", Number)
], CUserEntitlement.prototype, "aiFreeUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16, default: 'never', name: 'ai_free_reset_policy' }),
    __metadata("design:type", String)
], CUserEntitlement.prototype, "aiFreeResetPolicy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true, name: 'expire_at' }),
    __metadata("design:type", Object)
], CUserEntitlement.prototype, "expireAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'datetime', name: 'create_time' }),
    __metadata("design:type", Date)
], CUserEntitlement.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'datetime', name: 'update_time' }),
    __metadata("design:type", Date)
], CUserEntitlement.prototype, "updateTime", void 0);
exports.CUserEntitlement = CUserEntitlement = __decorate([
    (0, typeorm_1.Entity)('c_user_entitlements')
], CUserEntitlement);
//# sourceMappingURL=c-user-entitlement.entity.js.map