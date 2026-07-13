import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { Template } from '../../entities/template.entity';
import { StorageModule } from '../storage/storage.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { ResumeImportService } from './resume-import.service';
import { TemplateUsage } from '../../entities/template-usage.entity';
import { ResumeDownload } from '../../entities/resume-download.entity';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, ResumeVersion, Template, TemplateUsage, ResumeDownload]),
    StorageModule,
    EntitlementsModule,
    KnowledgeModule,
  ],
  providers: [ResumesService, ResumeImportService],
  controllers: [ResumesController],
  exports: [ResumesService],
})
export class ResumesModule {}
