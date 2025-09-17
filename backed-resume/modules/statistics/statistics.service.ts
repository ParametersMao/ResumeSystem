import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from '../../entities/statistic.entity';
import { Template } from '../../entities/template.entity';
import { CUser } from '../../entities/c-user.entity';
import { AiOperation } from '../../entities/ai-operation.entity';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';

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
  ) {}

  async getOverview(): Promise<any> {
    const [
      totalUsers,
      totalTemplates,
      totalAiOperations,
      totalDownloads,
      totalTemplateUsage
    ] = await Promise.all([
      this.cUserRepository.count(),
      this.templateRepository.count(),
      this.aiOperationRepository.count(),
      this.resumeDownloadRepository.count(),
      this.templateUsageRepository.count(),
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

    const [userTrend, aiOperationTrend, downloadTrend] = await Promise.all([
      this.cUserRepository
        .createQueryBuilder('user')
        .select('DATE(user.create_time)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('user.create_time >= :startDate', { startDate })
        .groupBy('DATE(user.create_time)')
        .orderBy('date', 'ASC')
        .getRawMany(),
      
      this.aiOperationRepository
        .createQueryBuilder('operation')
        .select('DATE(operation.create_time)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('operation.create_time >= :startDate', { startDate })
        .groupBy('DATE(operation.create_time)')
        .orderBy('date', 'ASC')
        .getRawMany(),
      
      this.resumeDownloadRepository
        .createQueryBuilder('download')
        .select('DATE(download.download_time)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('download.download_time >= :startDate', { startDate })
        .groupBy('DATE(download.download_time)')
        .orderBy('date', 'ASC')
        .getRawMany(),
    ]);

    return {
      user_trend: userTrend,
      ai_operation_trend: aiOperationTrend,
      download_trend: downloadTrend,
    };
  }

  async getPopularTemplates(): Promise<any> {
    const templates = await this.templateRepository
      .createQueryBuilder('template')
      .select([
        'template.id',
        'template.template_name',
        'template.use_count',
        'template.download_count',
      ])
      .orderBy('template.use_count', 'DESC')
      .addOrderBy('template.download_count', 'DESC')
      .limit(10)
      .getMany();

    return templates;
  }

  async getUserActivity(): Promise<any> {
    const users = await this.cUserRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.ai_operation_count',
      ])
      .orderBy('user.ai_operation_count', 'DESC')
      .limit(10)
      .getMany();

    return users;
  }
} 