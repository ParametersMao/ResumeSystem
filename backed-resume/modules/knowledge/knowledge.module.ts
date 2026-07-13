import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { Resume } from '../../entities/resume.entity';
import { StorageModule } from '../storage/storage.module';
import { KnowledgeAgentClientService } from './knowledge-agent-client.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { JobDescriptionController } from './job-description.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeDocument, Resume]), StorageModule],
  controllers: [KnowledgeController, JobDescriptionController],
  providers: [KnowledgeService, KnowledgeAgentClientService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
