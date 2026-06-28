import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from '../../entities/template.entity';
import { TemplateFavorite } from '../../entities/template-favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template, TemplateFavorite])],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {} 
