import { BadRequestException } from '@nestjs/common';
import { ResumeImportService } from './resume-import.service';

function textFile(content: string, name = 'resume.txt'): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'text/plain',
    size: Buffer.byteLength(content),
    buffer: Buffer.from(content),
    destination: '',
    filename: name,
    path: '',
    stream: undefined as any,
  };
}

describe('ResumeImportService', () => {
  const service = new ResumeImportService();

  it('extracts profile evidence and explicit sections from TXT', async () => {
    const result = await service.parse(
      textFile(`李明
13800138000
liming@example.com

项目经历
智能简历系统
负责需求分析与版本交付

技能特长
TypeScript、数据分析`),
    );

    expect(result.profile).toEqual({
      name: '李明',
      phone: '13800138000',
      email: 'liming@example.com',
    });
    expect(result.sections.map((section) => section.type)).toEqual(['projects', 'skills']);
    expect(result.sections[0].confidence).toBe('high');
  });

  it('rejects unsupported files', async () => {
    await expect(service.parse(textFile('not an image', 'resume.png'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects empty extracted text', async () => {
    await expect(service.parse(textFile('   '))).rejects.toBeInstanceOf(BadRequestException);
  });
});
