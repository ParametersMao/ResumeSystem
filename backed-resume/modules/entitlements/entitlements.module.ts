import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CUserEntitlement } from '../../entities/c-user-entitlement.entity';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { EntitlementsService } from './entitlements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CUserEntitlement, Resume, ResumeVersion]),
  ],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
