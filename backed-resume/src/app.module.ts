import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 导入实体
import { AdminUser } from '../entities/admin-user.entity';
import { CUser } from '../entities/c-user.entity';
import { Template } from '../entities/template.entity';
import { AiOperation } from '../entities/ai-operation.entity';
import { Statistic } from '../entities/statistic.entity';
import { TemplateUsage } from '../entities/template-usage.entity';
import { ResumeDownload } from '../entities/resume-download.entity';

// 导入功能模块
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CUsersModule } from '../modules/c-users/c-users.module';
import { TemplatesModule } from '../modules/templates/templates.module';
import { AiOperationsModule } from '../modules/ai-operations/ai-operations.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { ResumesModule } from '../modules/resumes/resumes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'resume_system',
      entities: [
        AdminUser,
        CUser,
        Template,
        AiOperation,
        Statistic,
        TemplateUsage,
        ResumeDownload,
      ],
      synchronize: false, // 关闭自动同步，避免每次启动都操作数据库。临时设置synchronize: true可同步数据表结构
      logging: process.env.NODE_ENV !== 'production',
      // 可选：添加migrations配置
      // migrations: ['dist/migrations/*.js'],
      // migrationsRun: true,
    }),
    AdminUsersModule,
    AuthModule,
    CUsersModule,
    TemplatesModule,
    AiOperationsModule,
    StatisticsModule,
    ResumesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 