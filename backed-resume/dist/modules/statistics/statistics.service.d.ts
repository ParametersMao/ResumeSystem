import { Repository } from 'typeorm';
import { Statistic } from '../../entities/statistic.entity';
import { Template } from '../../entities/template.entity';
import { CUser } from '../../entities/c-user.entity';
import { AiOperation } from '../../entities/ai-operation.entity';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';
export declare class StatisticsService {
    private statisticRepository;
    private templateRepository;
    private cUserRepository;
    private aiOperationRepository;
    private templateUsageRepository;
    private resumeDownloadRepository;
    constructor(statisticRepository: Repository<Statistic>, templateRepository: Repository<Template>, cUserRepository: Repository<CUser>, aiOperationRepository: Repository<AiOperation>, templateUsageRepository: Repository<TemplateUsage>, resumeDownloadRepository: Repository<ResumeDownload>);
    getOverview(): Promise<any>;
    getTrendData(period?: string): Promise<any>;
    getPopularTemplates(): Promise<any>;
    getUserActivity(): Promise<any>;
}
