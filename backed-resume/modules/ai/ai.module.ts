import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiOperationsModule } from '../ai-operations/ai-operations.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [AiOperationsModule, SystemConfigModule],
  controllers: [AiController],
  providers: [],
})
export class AiModule {}

