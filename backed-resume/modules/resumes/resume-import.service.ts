import { BadRequestException, Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

const pdfParse = require('pdf-parse') as (
  buffer: Buffer,
) => Promise<{ text?: string; numpages?: number }>;

export type ImportedSectionType =
  | 'education'
  | 'experience'
  | 'projects'
  | 'internship'
  | 'campus'
  | 'skills'
  | 'awards'
  | 'summary'
  | 'custom';

export interface ImportedSectionBlock {
  type: ImportedSectionType;
  title: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ResumeImportResult {
  filename: string;
  fileType: 'txt' | 'pdf' | 'docx';
  characterCount: number;
  pageCount?: number;
  rawText: string;
  profile: {
    name: string;
    phone: string;
    email: string;
  };
  sections: ImportedSectionBlock[];
  warnings: string[];
}

const SECTION_PATTERNS: Array<{
  type: ImportedSectionType;
  title: string;
  pattern: RegExp;
}> = [
  { type: 'education', title: '教育背景', pattern: /^(教育背景|教育经历|学习经历)$/i },
  { type: 'experience', title: '工作经历', pattern: /^(工作经历|工作经验|职业经历|任职经历)$/i },
  { type: 'projects', title: '项目经历', pattern: /^(项目经历|项目经验|项目实践)$/i },
  { type: 'internship', title: '实习经历', pattern: /^(实习经历|实习经验)$/i },
  { type: 'campus', title: '校园经历', pattern: /^(校园经历|校内经历|学生工作|社会实践)$/i },
  { type: 'skills', title: '技能特长', pattern: /^(专业技能|技能特长|技能清单|个人技能|技能)$/i },
  { type: 'awards', title: '荣誉证书', pattern: /^(荣誉证书|荣誉奖励|获奖经历|奖项证书|证书)$/i },
  { type: 'summary', title: '自我评价', pattern: /^(个人优势|自我评价|个人总结|个人简介|职业概述)$/i },
];

@Injectable()
export class ResumeImportService {
  async parse(file: Express.Multer.File): Promise<ResumeImportResult> {
    const fileType = this.resolveFileType(file);
    const extracted = await this.extractText(file, fileType);
    const rawText = normalizeText(extracted.text);

    if (rawText.length < 10) {
      throw new BadRequestException(
        '未能从文件中提取到足够文本；扫描版 PDF 请先进行 OCR 后再导入',
      );
    }

    const warnings: string[] = [
      '导入结果由规则识别生成，请在保存前核对姓名、时间、公司与岗位字段。',
    ];
    if (fileType === 'pdf') {
      warnings.push('PDF 的视觉分栏可能改变文本顺序，请重点核对左右栏内容。');
    }
    if (rawText.length > 30000) {
      warnings.push('文件内容较长，系统仅保留前 30000 个字符用于本次导入。');
    }

    const text = rawText.slice(0, 30000);
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

    return {
      filename: sanitizeFilename(file.originalname),
      fileType,
      characterCount: text.length,
      pageCount: extracted.pageCount,
      rawText: text,
      profile: detectProfile(lines),
      sections: splitSections(lines),
      warnings,
    };
  }

  private resolveFileType(file: Express.Multer.File): 'txt' | 'pdf' | 'docx' {
    const extension = file.originalname.split('.').pop()?.toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (extension === 'txt') return 'txt';
    if (extension === 'pdf') return 'pdf';
    if (
      extension === 'docx'
    ) {
      return 'docx';
    }
    if (extension && extension !== file.originalname.toLowerCase()) {
      throw new BadRequestException('仅支持 TXT、PDF 和 DOCX 文件');
    }
    if (mime.startsWith('text/plain')) return 'txt';
    if (mime === 'application/pdf') return 'pdf';
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';

    throw new BadRequestException('仅支持 TXT、PDF 和 DOCX 文件');
  }

  private async extractText(
    file: Express.Multer.File,
    fileType: 'txt' | 'pdf' | 'docx',
  ): Promise<{ text: string; pageCount?: number }> {
    try {
      if (fileType === 'txt') {
        return { text: file.buffer.toString('utf8').replace(/^\uFEFF/, '') };
      }
      if (fileType === 'docx') {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        return { text: result.value };
      }
      const result = await pdfParse(file.buffer);
      return { text: result.text || '', pageCount: result.numpages };
    } catch {
      throw new BadRequestException('文件解析失败，请确认文件未损坏且未加密');
    }
  }
}

function normalizeText(value: string): string {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t\u00a0]+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeFilename(value: string): string {
  return String(value || 'resume').replace(/[\\/<>:"|?*]/g, '_').slice(0, 180);
}

function detectProfile(lines: string[]) {
  const joined = lines.slice(0, 30).join(' ');
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = joined.match(/(?<!\d)(?:\+?86[- ]?)?1[3-9]\d{9}(?!\d)/)?.[0] || '';
  const name = lines.find((line, index) => {
    if (index > 8 || line.length < 2 || line.length > 20) return false;
    if (/简历|求职|resume|curriculum|姓名|电话|邮箱|@/i.test(line)) return false;
    if (SECTION_PATTERNS.some((section) => section.pattern.test(cleanHeading(line)))) return false;
    return /^[\u4e00-\u9fa5·]{2,8}$/.test(line) || /^[A-Za-z][A-Za-z .'-]{2,30}$/.test(line);
  }) || '';

  return { name, phone: phone.replace(/^\+?86[- ]?/, ''), email };
}

function splitSections(lines: string[]): ImportedSectionBlock[] {
  const blocks: ImportedSectionBlock[] = [];
  let active: { type: ImportedSectionType; title: string; lines: string[] } | null = null;
  const unassigned: string[] = [];

  for (const line of lines) {
    const heading = cleanHeading(line);
    const matched = SECTION_PATTERNS.find((section) => section.pattern.test(heading));
    if (matched) {
      if (active?.lines.length) blocks.push(toBlock(active, 'high'));
      active = { type: matched.type, title: matched.title, lines: [] };
      continue;
    }
    if (active) active.lines.push(line);
    else unassigned.push(line);
  }
  if (active?.lines.length) blocks.push(toBlock(active, 'high'));

  const meaningfulUnassigned = unassigned
    .filter((line) => !/@|(?:\+?86[- ]?)?1[3-9]\d{9}/.test(line))
    .join('\n')
    .trim();
  if (meaningfulUnassigned.length > 80) {
    blocks.unshift({
      type: 'custom',
      title: '未归类内容',
      text: meaningfulUnassigned,
      confidence: 'low',
    });
  }

  if (!blocks.length) {
    blocks.push({
      type: 'custom',
      title: '原简历内容',
      text: lines.join('\n'),
      confidence: 'low',
    });
  }
  return blocks;
}

function cleanHeading(value: string): string {
  return value.replace(/^[\s【\[（(]*|[：:】\]）)\s]*$/g, '').replace(/[：:]$/, '').trim();
}

function toBlock(
  value: { type: ImportedSectionType; title: string; lines: string[] },
  confidence: ImportedSectionBlock['confidence'],
): ImportedSectionBlock {
  return {
    type: value.type,
    title: value.title,
    text: value.lines.join('\n').trim(),
    confidence,
  };
}
