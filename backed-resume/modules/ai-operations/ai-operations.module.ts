import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiOperationsController } from './ai-operations.controller';
import { AiOperationsService } from './ai-operations.service';
import { AiOperation } from '../../entities/ai-operation.entity';
import { CUsersModule } from '../c-users/c-users.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiOperation]),
    CUsersModule,
    EntitlementsModule,
  ],
  controllers: [AiOperationsController],
  providers: [AiOperationsService],
  exports: [AiOperationsService],
})
export class AiOperationsModule {}
