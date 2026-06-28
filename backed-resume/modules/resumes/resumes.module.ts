import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume } from '../../entities/resume.entity';
import { ResumeVersion } from '../../entities/resume-version.entity';
import { StorageModule } from '../storage/storage.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, ResumeVersion]),
    StorageModule,
    EntitlementsModule,
  ],
  providers: [ResumesService],
  controllers: [ResumesController],
  exports: [ResumesService],
})
export class ResumesModule {}
