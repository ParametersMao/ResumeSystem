import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiOperationsModule } from '../ai-operations/ai-operations.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { AiAgentClientService } from './ai-agent-client.service';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { ResumesModule } from '../resumes/resumes.module';

@Module({
  imports: [AiOperationsModule, SystemConfigModule, EntitlementsModule, ResumesModule],
  controllers: [AiController],
  providers: [AiAgentClientService],
})
export class AiModule {}

