import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiOperationsModule } from '../ai-operations/ai-operations.module';

@Module({
  imports: [AiOperationsModule],
  controllers: [AiController],
})
export class AiModule {}

