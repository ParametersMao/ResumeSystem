import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUsersController } from './c-users.controller';
import { CUsersService } from './c-users.service';
import { CUser } from '../../entities/c-user.entity';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [TypeOrmModule.forFeature([CUser]), KnowledgeModule],
  controllers: [CUsersController],
  providers: [CUsersService],
  exports: [CUsersService],
})
export class CUsersModule {}
