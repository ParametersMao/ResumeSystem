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

  private normalizeLimit(limit: number | undefined, fallback: number, max: number): number {
    const value = Number(limit);
    if (!Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return Math.min(Math.floor(value), max);
  }

  async getOverview(): Promise<any> {
    const [
      totalUsers,
      totalTemplates,
      totalAiOperations,
      totalDownloads,
      totalTemplateUsage,
      totalResumes,
    ] = await Promise.all([
      this.safeCount(this.cUserRepository),
      this.safeCount(this.templateRepository),
      this.safeCount(this.aiOperationRepository),
      this.safeCount(this.resumeDownloadRepository),
      this.safeCount(this.templateUsageRepository),
      this.safeCount(this.resumeRepository),
    ]);

    return {
      total_users: totalUsers,
      total_templates: totalTemplates,
      total_ai_operations: totalAiOperations,
      total_downloads: totalDownloads,
      total_template_usage: totalTemplateUsage,
      total_resumes: totalResumes,
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

  async getPopularTemplates(limit: number = 5): Promise<any> {
    try {
      const safeLimit = this.normalizeLimit(limit, 5, 50);
      const rows = await this.templateRepository.query(
        `
          SELECT
            t.id AS id,
            t.name AS templateName,
            t.use_count AS storedUseCount,
            COALESCE(u.usageCount, 0) AS usageCount,
            COALESCE(d.downloadCount, 0) AS downloadCount,
            GREATEST(
              COALESCE(t.use_count, 0),
              COALESCE(u.usageCount, 0) + COALESCE(d.downloadCount, 0)
            ) AS useCount
          FROM templates t
          LEFT JOIN (
            SELECT template_id, COUNT(*) AS usageCount
            FROM template_usage
            GROUP BY template_id
          ) u ON u.template_id = t.id
          LEFT JOIN (
            SELECT template_id, COUNT(*) AS downloadCount
            FROM resume_downloads
            GROUP BY template_id
          ) d ON d.template_id = t.id
          WHERE t.is_active = 1
          ORDER BY useCount DESC, t.create_time DESC
          LIMIT ?
        `,
        [safeLimit],
      );

      return rows.map((row: any) => ({
        id: Number(row.id),
        templateName: row.templateName,
        useCount: Number(row.useCount || 0),
        usageCount: Number(row.usageCount || 0),
        downloadCount: Number(row.downloadCount || 0),
        storedUseCount: Number(row.storedUseCount || 0),
      }));
    } catch (e) {
      // 降级：避免统计面板整页 500。
      return [];
    }
  }

  async getUserActivity(limit: number = 10): Promise<any> {
    try {
      const safeLimit = this.normalizeLimit(limit, 10, 50);
      const rows = await this.cUserRepository.query(
        `
          SELECT
            u.id AS id,
            u.username AS username,
            COUNT(ao.id) AS aiOperationCount
          FROM c_users u
          LEFT JOIN ai_operations ao ON ao.user_id = u.id
          WHERE u.status = 1
          GROUP BY u.id, u.username
          ORDER BY aiOperationCount DESC, u.create_time DESC
          LIMIT ?
        `,
        [safeLimit],
      );

      return rows.map((row: any) => ({
        id: Number(row.id),
        username: row.username,
        ai_operation_count: Number(row.aiOperationCount || 0),
      }));
    } catch (e) {
      const safeLimit = this.normalizeLimit(limit, 10, 50);
      const rawUsers = await this.cUserRepository.find({
        select: { id: true, username: true },
        where: { status: 1 },
        order: { createTime: 'DESC' },
        take: safeLimit,
      });

      const counts = await this.aiOperationRepository
        .createQueryBuilder('ao')
        .select('ao.user_id', 'userId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ao.user_id')
        .getRawMany();

      const countMap = new Map(counts.map(c => [Number(c.userId), Number(c.count)]));

      return rawUsers.map(u => ({
        id: u.id,
        username: u.username,
        ai_operation_count: countMap.get(u.id) || 0,
      }));
    }
  }
}
