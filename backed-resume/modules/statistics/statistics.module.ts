import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Statistic } from '../../entities/statistic.entity';
import { Template } from '../../entities/template.entity';
import { CUser } from '../../entities/c-user.entity';
import { AiOperation } from '../../entities/ai-operation.entity';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';
import { Resume } from '../../entities/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Statistic,
      Template,
      CUser,
      AiOperation,
      TemplateUsage,
      ResumeDownload,
      Resume,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {} 