import { BadRequestException } from '@nestjs/common';
import { inflateRawSync } from 'zlib';
import { extname } from 'path';

export const MAX_KNOWLEDGE_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCX_ENTRIES = 2_000;
const MAX_DOCX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;
const MAX_DOCX_ENTRY_BYTES = 20 * 1024 * 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.markdown': 'text/markdown; charset=utf-8',
};

export interface ValidatedKnowledgeFile {
  extension: string;
  mimeType: string;
}

export function validateKnowledgeFile(file: Express.Multer.File): ValidatedKnowledgeFile {
  if (!file || !Buffer.isBuffer(file.buffer)) {
    throw new BadRequestException('请选择有效的知识库文件');
  }
  if (!file.buffer.length) throw new BadRequestException('知识库文件不能为空');
  if (file.buffer.length > MAX_KNOWLEDGE_FILE_SIZE) {
    throw new BadRequestException('知识库文件不能超过 10MB');
  }
  if (Number(file.size) !== file.buffer.length) {
    throw new BadRequestException('知识库文件大小校验失败');
  }

  const fileName = String(file.originalname || '').trim();
  if (!fileName || Buffer.byteLength(fileName, 'utf8') > 240 || /[\r\n\0]/.test(fileName)) {
    throw new BadRequestException('知识库文件名无效或过长');
  }

  const extension = extname(fileName).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) {
    throw new BadRequestException('仅支持 PDF、DOCX、TXT 和 Markdown 文件');
  }

  if (extension === '.pdf') validatePdf(file.buffer);
  else if (extension === '.docx') validateDocx(file.buffer);
  else validateUtf8Text(file.buffer);

  return { extension, mimeType };
}

function validatePdf(buffer: Buffer) {
  const header = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
  if (header.indexOf('%PDF-') < 0) throw new BadRequestException('PDF 文件签名无效');

  const trailer = buffer.subarray(Math.max(0, buffer.length - 1024 * 1024)).toString('latin1');
  if (!trailer.includes('%%EOF')) throw new BadRequestException('PDF 文件不完整');

  const source = buffer.toString('latin1');
  const blockedFeatures = [
    /\/Encrypt\b/i,
    /\/JavaScript\b/i,
    /\/JS\b/i,
    /\/Launch\b/i,
    /\/EmbeddedFile\b/i,
    /\/RichMedia\b/i,
    /\/XFA\b/i,
  ];
  if (blockedFeatures.some((pattern) => pattern.test(source))) {
    throw new BadRequestException('PDF 包含加密、脚本、附件或其他不安全的活动内容');
  }

  const pageCount = (source.match(/\/Type\s*\/Page\b/g) || []).length;
  if (pageCount > 500) throw new BadRequestException('PDF 页数超过 500 页限制');
}

function validateUtf8Text(buffer: Buffer) {
  if (buffer.includes(0)) throw new BadRequestException('文本文件包含二进制内容');
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new BadRequestException('文本文件必须使用 UTF-8 编码');
  }

  const controlCharacters = (text.match(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
  if (controlCharacters > Math.max(8, Math.floor(text.length * 0.001))) {
    throw new BadRequestException('文本文件包含过多控制字符');
  }
}

interface ZipEntry {
  name: string;
  flags: number;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  localHeaderOffset: number;
}

function validateDocx(buffer: Buffer) {
  if (buffer.length < 22 || buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new BadRequestException('DOCX 文件签名无效');
  }

  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) throw new BadRequestException('DOCX ZIP 目录不完整');
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectorySize = buffer.readUInt32LE(eocdOffset + 12);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  if (entryCount === 0xffff || centralDirectorySize === 0xffffffff || centralDirectoryOffset === 0xffffffff) {
    throw new BadRequestException('不支持 ZIP64 格式的 DOCX 文件');
  }
  if (entryCount < 1 || entryCount > MAX_DOCX_ENTRIES) {
    throw new BadRequestException(`DOCX 内部文件数量不能超过 ${MAX_DOCX_ENTRIES}`);
  }
  if (centralDirectoryOffset + centralDirectorySize > eocdOffset) {
    throw new BadRequestException('DOCX ZIP 目录偏移无效');
  }

  const entries: ZipEntry[] = [];
  let offset = centralDirectoryOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new BadRequestException('DOCX ZIP 目录项无效');
    }
    const flags = buffer.readUInt16LE(offset + 8);
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const nextOffset = offset + 46 + fileNameLength + extraLength + commentLength;
    if (nextOffset > buffer.length) throw new BadRequestException('DOCX ZIP 目录项越界');

    const name = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8').replace(/\\/g, '/');
    if (!name || name.startsWith('/') || /(^|\/)\.\.($|\/)/.test(name) || name.includes('\0')) {
      throw new BadRequestException('DOCX 包含不安全的内部路径');
    }
    if ((flags & 0x1) !== 0) throw new BadRequestException('不支持加密的 DOCX 文件');
    if (method !== 0 && method !== 8) throw new BadRequestException('DOCX 使用了不支持的压缩算法');
    if (uncompressedSize > MAX_DOCX_ENTRY_BYTES) {
      throw new BadRequestException('DOCX 单个内部文件解压后过大');
    }
    if (compressedSize === 0 && uncompressedSize > 0) {
      throw new BadRequestException('DOCX 压缩大小无效');
    }
    if (uncompressedSize > 1024 * 1024 && uncompressedSize / Math.max(1, compressedSize) > 200) {
      throw new BadRequestException('DOCX 压缩比异常，可能存在压缩炸弹');
    }

    totalUncompressed += uncompressedSize;
    if (totalUncompressed > MAX_DOCX_UNCOMPRESSED_BYTES) {
      throw new BadRequestException('DOCX 解压后总大小超过 50MB');
    }
    entries.push({ name, flags, method, compressedSize, uncompressedSize, localHeaderOffset });
    offset = nextOffset;
  }

  const lowerNames = new Set(entries.map((entry) => entry.name.toLowerCase()));
  if (!lowerNames.has('[content_types].xml') || !lowerNames.has('word/document.xml')) {
    throw new BadRequestException('文件不是有效的 DOCX 文档');
  }
  const forbiddenPath = entries.some((entry) =>
    /(^|\/)(vbaproject\.bin|embeddings|activex|oleobjects|externallinks)(\/|$)/i.test(entry.name),
  );
  if (forbiddenPath) throw new BadRequestException('DOCX 包含宏、嵌入对象或外部链接组件');

  for (const entry of entries.filter((item) => item.name.toLowerCase().endsWith('.rels'))) {
    const relationshipXml = readSmallZipEntry(buffer, entry);
    const relationshipTags = relationshipXml.match(/<Relationship\b[^>]*>/gi) || [];
    for (const tag of relationshipTags) {
      if (!/TargetMode\s*=\s*["']External["']/i.test(tag)) continue;
      const isNormalHyperlink = /Type\s*=\s*["'][^"']*\/hyperlink["']/i.test(tag);
      const target = tag.match(/Target\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const isLocalFileTarget = /^(?:file:|\\\\|\/)/i.test(target);
      if (!isNormalHyperlink || isLocalFileTarget) {
        throw new BadRequestException('DOCX 包含不安全的外部关系链接');
      }
    }
  }
}

function findEndOfCentralDirectory(buffer: Buffer): number {
  const minimum = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function readSmallZipEntry(buffer: Buffer, entry: ZipEntry): string {
  if (entry.uncompressedSize > 1024 * 1024) {
    throw new BadRequestException('DOCX 关系文件过大');
  }
  const offset = entry.localHeaderOffset;
  if (offset + 30 > buffer.length || buffer.readUInt32LE(offset) !== 0x04034b50) {
    throw new BadRequestException('DOCX 本地 ZIP 目录项无效');
  }
  const fileNameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataOffset = offset + 30 + fileNameLength + extraLength;
  const dataEnd = dataOffset + entry.compressedSize;
  if (dataEnd > buffer.length) throw new BadRequestException('DOCX 压缩数据越界');
  const compressed = buffer.subarray(dataOffset, dataEnd);
  try {
    const content = entry.method === 0
      ? compressed
      : inflateRawSync(compressed, { maxOutputLength: 1024 * 1024 + 1 });
    if (content.length !== entry.uncompressedSize || content.length > 1024 * 1024) {
      throw new Error('size mismatch');
    }
    return content.toString('utf8');
  } catch {
    throw new BadRequestException('DOCX 关系文件解压失败或大小不符');
  }
}
