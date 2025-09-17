"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express = require("express");
async function bootstrap() {
    process.on('uncaughtException', (err) => {
        console.error('uncaughtException:', err);
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('unhandledRejection:', reason);
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    await app.listen(process.env.PORT || 3030);
    console.log(`服务已启动，监听端口：${process.env.PORT || 3030}`);
}
bootstrap();
//# sourceMappingURL=main.js.map