import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../../entities/resume.entity';
import { CreateResumeDto, UpdateResumeDto, ResumeResponseDto, ResumeListResponseDto } from '../../dto/resume.dto';
import { PaginationResponse } from '../../common/interfaces/pagination.interface';
import * as puppeteer from 'puppeteer';
import * as OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ResumesService {
  private ossClient: OSS | null = null;

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {
    // 只有在配置完整时才初始化OSS客户端
    const ossConfig = {
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
    };

    // 检查所有必需的配置是否存在
    if (ossConfig.region && ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket) {
      this.ossClient = new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        bucket: ossConfig.bucket,
      });
    }
  }

  async create(createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    const resume = this.resumeRepository.create(createResumeDto);
    const savedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(savedResume);
  }

  async findAllByUser(userId: number, page = 1, limit = 10): Promise<PaginationResponse<ResumeListResponseDto>> {
    const skip = (page - 1) * limit;
    
    const [resumes, total] = await this.resumeRepository.findAndCount({
      where: { userId, status: 1 },
      relations: ['template', 'user'],
      order: { updateTime: 'DESC' },
      skip,
      take: limit,
    });

    const responseData = resumes.map(resume => this.mapToListResponseDto(resume));

    return {
      list: responseData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, userId?: number): Promise<ResumeResponseDto> {
    const where: any = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({
      where,
      relations: ['template', 'user'],
    });

    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    return this.mapToResponseDto(resume);
  }

  async update(id: number, updateResumeDto: UpdateResumeDto, userId?: number): Promise<ResumeResponseDto> {
    const where: any = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    // Version conflict check
    if (updateResumeDto.version !== undefined && resume.version !== updateResumeDto.version) {
      throw new ConflictException('简历版本冲突，请刷新后重试');
    }

    // Update fields
    Object.assign(resume, updateResumeDto);
    resume.version += 1;

    const updatedResume = await this.resumeRepository.save(resume);
    return this.mapToResponseDto(updatedResume);
  }

  async remove(id: number, userId?: number): Promise<void> {
    const where: any = { id, status: 1 };
    if (userId) where.userId = userId;

    const resume = await this.resumeRepository.findOne({ where });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    // Soft delete
    resume.status = 0;
    await this.resumeRepository.save(resume);
  }

  async exportPdf(html: string): Promise<string> {
    // 1. 使用puppeteer生成PDF
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // 2. 如果OSS配置了，上传到OSS；否则返回base64
    if (this.ossClient) {
      const fileName = `resume-${uuidv4()}.pdf`;
      const result = await this.ossClient.put(fileName, pdfBuffer);
      return result.url;
    } else {
      // 如果没有配置OSS，返回base64编码的PDF
      return `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`;
    }
  }

  private mapToResponseDto(resume: Resume): ResumeResponseDto {
    return {
      id: resume.id,
      title: resume.title,
      content: resume.content,
      templateId: resume.templateId,
      templateName: resume.template?.templateName,
      userId: resume.userId,
      userName: resume.user?.username,
      previewImage: resume.previewImage,
      status: resume.status,
      version: resume.version,
      createTime: resume.createTime,
      updateTime: resume.updateTime,
    };
  }

  private mapToListResponseDto(resume: Resume): ResumeListResponseDto {
    return {
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      templateName: resume.template?.templateName,
      userId: resume.userId,
      userName: resume.user?.username,
      previewImage: resume.previewImage,
      status: resume.status,
      version: resume.version,
      createTime: resume.createTime,
      updateTime: resume.updateTime,
    };
  }
}