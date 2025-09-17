"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CUsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const c_users_controller_1 = require("./c-users.controller");
const c_users_service_1 = require("./c-users.service");
const c_user_entity_1 = require("../../entities/c-user.entity");
let CUsersModule = class CUsersModule {
};
exports.CUsersModule = CUsersModule;
exports.CUsersModule = CUsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([c_user_entity_1.CUser])],
        controllers: [c_users_controller_1.CUsersController],
        providers: [c_users_service_1.CUsersService],
        exports: [c_users_service_1.CUsersService],
    })
], CUsersModule);
//# sourceMappingURL=c-users.module.js.map