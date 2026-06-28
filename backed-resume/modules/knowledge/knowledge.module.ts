import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeDocument } from '../../entities/knowledge-document.entity';
import { StorageModule } from '../storage/storage.module';
import { KnowledgeAgentClientService } from './knowledge-agent-client.service';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeDocument]), StorageModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeService, KnowledgeAgentClientService],
})
export class KnowledgeModule {}
