import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import { buildAllowedOrigins, validateCorsOrigin } from './cors';
import { createUploadStaticHandlers } from './upload-static';

async function bootstrap() {
  // 全局异常监听，输出所有未捕获异常
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandledRejection:', reason);
  });

  // 生产环境日志等级仅保留 error 和 warn
  const loggerLevels = (
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['error', 'warn', 'log', 'debug', 'verbose']
  ) as ('error' | 'warn' | 'log' | 'debug' | 'verbose')[];

  const app = await NestFactory.create(AppModule, { logger: loggerLevels });

  // 全局 CORS 配置：允许指定前端域名
  const allowedOrigins = buildAllowedOrigins(process.env.FRONTEND_URL);

  app.enableCors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如 Postman）
      validateCorsOrigin(origin, allowedOrigins, callback);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // 全局启用验证和转换
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // 增加请求体大小限制
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 静态资源：本地上传文件与 mock 资源（不接 OSS 的阶段性方案）
  app.use('/uploads', ...createUploadStaticHandlers());
  app.use('/mock', express.static(join(process.cwd(), 'public', 'mock')));

  await app.listen(process.env.PORT || 3000);
  console.log(`服务已启动，监听端口：${process.env.PORT || 3000}`);
}
bootstrap();
