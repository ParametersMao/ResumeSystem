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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const system_logs_service_1 = require("../../modules/system-logs/system-logs.service");
function safeStringify(input, maxLen = 2000) {
    try {
        const json = JSON.stringify(input);
        if (!json)
            return '';
        return json.length > maxLen ? json.slice(0, maxLen) : json;
    }
    catch {
        return '';
    }
}
function maskSensitive(obj) {
    if (!obj || typeof obj !== 'object')
        return obj;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    const keys = ['password', 'token', 'access_token', 'authorization', 'secret'];
    for (const k of Object.keys(clone)) {
        if (keys.includes(k.toLowerCase())) {
            clone[k] = '[masked]';
        }
        else if (typeof clone[k] === 'object' && clone[k] !== null) {
            clone[k] = maskSensitive(clone[k]);
        }
    }
    return clone;
}
let AuditLogInterceptor = class AuditLogInterceptor {
    systemLogs;
    constructor(systemLogs) {
        this.systemLogs = systemLogs;
    }
    intercept(context, next) {
        const startedAt = Date.now();
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const route = (req.originalUrl || req.url || '').slice(0, 255);
        const method = String(req.method || '').toUpperCase().slice(0, 12);
        const ip = (req.ip || req.headers?.['x-forwarded-for'] || '').toString().slice(0, 64) || null;
        const userAgent = (req.headers?.['user-agent'] || '').toString().slice(0, 512) || null;
        const userId = req.user?.id ?? null;
        const userType = req.user?.type ?? null;
        const paramsJson = safeStringify(maskSensitive({ query: req.query, body: req.body }), 2000) || null;
        let capturedError = null;
        return next.handle().pipe((0, rxjs_1.catchError)((err) => {
            capturedError = err;
            return (0, rxjs_1.throwError)(() => err);
        }), (0, rxjs_1.finalize)(() => {
            const durationMs = Date.now() - startedAt;
            const statusCode = Number(res?.statusCode) || (capturedError?.status ?? null);
            Promise.resolve().then(async () => {
                try {
                    await this.systemLogs.create({
                        userId,
                        userType,
                        route,
                        method,
                        ip,
                        userAgent,
                        statusCode: statusCode ?? null,
                        durationMs,
                        paramsJson,
                    });
                }
                catch {
                }
            });
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [system_logs_service_1.SystemLogsService])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map