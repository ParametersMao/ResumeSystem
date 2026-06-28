import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { Resume } from '../entities/resume.entity';
import { CUserProfile } from '../entities/c-user-profile.entity';
import { CUserEntitlement } from '../entities/c-user-entitlement.entity';
import { ResumeVersion } from '../entities/resume-version.entity';
import { SystemLog } from '../entities/system-log.entity';
import { TemplateFavorite } from '../entities/template-favorite.entity';
import { SystemConfig } from '../entities/system-config.entity';
import { KnowledgeDocument } from '../entities/knowledge-document.entity';
import { EmailVerificationCode } from '../entities/email-verification-code.entity';
import { UserIdentity } from '../entities/user-identity.entity';

// 导入功能模块
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CUsersModule } from '../modules/c-users/c-users.module';
import { TemplatesModule } from '../modules/templates/templates.module';
import { AiOperationsModule } from '../modules/ai-operations/ai-operations.module';
import { StatisticsModule } from '../modules/statistics/statistics.module';
import { ResumesModule } from '../modules/resumes/resumes.module';
import { CuserProfileModule } from '../modules/cuser-profile/cuser-profile.module';
import { EntitlementsModule } from '../modules/entitlements/entitlements.module';
import { SystemLogsModule } from '../modules/system-logs/system-logs.module';
import { AiModule } from '../modules/ai/ai.module';
import { SystemConfigModule } from '../modules/system-config/system-config.module';
import { KnowledgeModule } from '../modules/knowledge/knowledge.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? 'config.production.env'
        : 'config.env',
    }),
    // API 限流：登录接口 20次/分钟，其他接口 100次/分钟
    ThrottlerModule.forRoot([
      {
        name: 'login',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
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
        Resume,
        ResumeVersion,
        CUserProfile,
        CUserEntitlement,
        SystemLog,
        TemplateFavorite,
        SystemConfig,
        KnowledgeDocument,
        EmailVerificationCode,
        UserIdentity,
      ],
      synchronize: false,
      // 生产环境禁用日志记录
      logging: process.env.NODE_ENV !== 'production',
    }),
    AdminUsersModule,
    AuthModule,
    CUsersModule,
    TemplatesModule,
    AiOperationsModule,
    StatisticsModule,
    ResumesModule,
    CuserProfileModule,
    EntitlementsModule,
    SystemLogsModule,
    AiModule,
    SystemConfigModule,
    KnowledgeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
