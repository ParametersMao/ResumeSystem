import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { Statistic } from '../../entities/statistic.entity';
import { Template } from '../../entities/template.entity';
import { CUser } from '../../entities/c-user.entity';
import { AiOperation } from '../../entities/ai-operation.entity';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';
import { Resume } from '../../entities/resume.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistic)
    private statisticRepository: Repository<Statistic>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(CUser)
    private cUserRepository: Repository<CUser>,
    @InjectRepository(AiOperation)
    private aiOperationRepository: Repository<AiOperation>,
    @InjectRepository(TemplateUsage)
    private templateUsageRepository: Repository<TemplateUsage>,
    @InjectRepository(ResumeDownload)
    private resumeDownloadRepository: Repository<ResumeDownload>,
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  private async safeCount<T extends ObjectLiteral>(repo: Repository<T>, fallback = 0): Promise<number> {
    try {
      return await repo.count();
    } catch (e) {
      return fallback;
    }
  }

  private async safeRawMany<T>(fn: () => Promise<T[]>, fallback: T[] = []): Promise<T[]> {
    try {
      return await fn();
    } catch (e) {
      return fallback;
    }
  }

  async getOverview(): Promise<any> {
    const [totalUsers, totalTemplates, totalAiOperations, totalDownloads, totalTemplateUsage] = await Promise.all([
      this.safeCount(this.cUserRepository),
      this.safeCount(this.templateRepository),
      this.safeCount(this.aiOperationRepository),
      this.safeCount(this.resumeDownloadRepository),
      this.safeCount(this.templateUsageRepository),
    ]);

    return {
      total_users: totalUsers,
      total_templates: totalTemplates,
      total_ai_operations: totalAiOperations,
      total_downloads: totalDownloads,
      total_template_usage: totalTemplateUsage,
    };
  }

  async getTrendData(period: string = 'day'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const [userTrend, aiOperationTrend, downloadTrend, resumeTrend] = await Promise.all([
      this.safeRawMany(() =>
        this.cUserRepository
          .createQueryBuilder('user')
          .select('DATE(user.create_time)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('user.create_time >= :startDate', { startDate })
          .groupBy('DATE(user.create_time)')
          .orderBy('date', 'ASC')
          .getRawMany(),
      ),
      this.safeRawMany(() =>
        this.aiOperationRepository
          .createQueryBuilder('operation')
          .select('DATE(operation.create_time)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('operation.create_time >= :startDate', { startDate })
          .groupBy('DATE(operation.create_time)')
          .orderBy('date', 'ASC')
          .getRawMany(),
      ),
      this.safeRawMany(() =>
        this.resumeDownloadRepository
          .createQueryBuilder('download')
          .select('DATE(download.download_time)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('download.download_time >= :startDate', { startDate })
          .groupBy('DATE(download.download_time)')
          .orderBy('date', 'ASC')
          .getRawMany(),
      ),
      this.safeRawMany(() =>
        this.resumeRepository
          .createQueryBuilder('resume')
          .select('DATE(resume.create_time)', 'date')
          .addSelect('COUNT(*)', 'count')
          .where('resume.create_time >= :startDate', { startDate })
          .groupBy('DATE(resume.create_time)')
          .orderBy('date', 'ASC')
          .getRawMany(),
      ),
    ]);

    return {
      user_trend: userTrend,
      ai_operation_trend: aiOperationTrend,
      download_trend: downloadTrend,
      resume_trend: resumeTrend,
    };
  }

  async getPopularTemplates(limit: number = 10): Promise<any> {
    try {
      const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;
      return await this.templateRepository.find({
        select: {
          id: true,
          templateName: true,
          useCount: true,
        },
        order: { useCount: 'DESC' },
        take: safeLimit,
      });
    } catch (e) {
      // 降级：避免统计面板整页 500
      return [];
    }
  }

  async getUserActivity(): Promise<any> {
    try {
      const users = await this.cUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username'])
        .loadRelationCountAndMap('user.aiOperationCount', 'user.aiOperations')
        .orderBy('user.aiOperationCount', 'DESC')
        .limit(10)
        .getMany();

      return users.map(u => ({
        id: u.id,
        username: u.username,
        ai_operation_count: (u as any).aiOperationCount || 0,
      }));
    } catch (e) {
      // 降级：直接查询 ai_operations 表
      const rawUsers = await this.cUserRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username'])
        .limit(10)
        .getMany();

      const counts = await this.aiOperationRepository
        .createQueryBuilder('ao')
        .select('ao.user_id', 'userId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ao.user_id')
        .getRawMany();

      const countMap = new Map(counts.map(c => [c.userId, parseInt(c.count)]));

      return rawUsers.map(u => ({
        id: u.id,
        username: u.username,
        ai_operation_count: countMap.get(u.id) || 0,
      }));
    }
  }
} 