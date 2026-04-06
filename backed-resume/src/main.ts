import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  // 全局异常监听，输出所有未捕获异常
  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('unhandledRejection:', reason);
  });

  // 设置Nest日志等级，输出所有日志
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });
  
  // 全局启用验证和转换
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  
  // 增加请求体大小限制
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 静态资源：本地上传文件与 mock 资源（不接 OSS 的阶段性方案）
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  app.use('/mock', express.static(join(process.cwd(), 'public', 'mock')));

  await app.listen(process.env.PORT || 3030);
  console.log(`服务已启动，监听端口：${process.env.PORT || 3030}`);
}
bootstrap(); 