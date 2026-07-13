import { BadRequestException } from '@nestjs/common';
import { MAX_KNOWLEDGE_FILE_SIZE, validateKnowledgeFile } from './knowledge-file-validation';

describe('knowledge file validation', () => {
  it('accepts UTF-8 Markdown and derives a trusted MIME type', () => {
    const file = makeFile('standard.md', Buffer.from('# 简历标准\n使用事实和量化结果。'));
    expect(validateKnowledgeFile(file)).toEqual({
      extension: '.md',
      mimeType: 'text/markdown; charset=utf-8',
    });
  });

  it('rejects extension spoofing, oversized content and active PDFs', () => {
    expect(() => validateKnowledgeFile(makeFile('fake.pdf', Buffer.from('plain text')))).toThrow(
      BadRequestException,
    );
    const oversized = Buffer.alloc(MAX_KNOWLEDGE_FILE_SIZE + 1, 65);
    expect(() => validateKnowledgeFile(makeFile('large.txt', oversized))).toThrow(/10MB/);
    const activePdf = Buffer.from('%PDF-1.7\n1 0 obj<</Type/Catalog/OpenAction<</S/JavaScript/JS(x)>>>>endobj\n%%EOF');
    expect(() => validateKnowledgeFile(makeFile('active.pdf', activePdf))).toThrow(/不安全/);
  });

  it('accepts a minimal DOCX container and rejects embedded components', () => {
    const safeDocx = makeStoredZip([
      ['[Content_Types].xml', '<Types/>'],
      ['word/document.xml', '<w:document/>'],
    ]);
    expect(validateKnowledgeFile(makeFile('resume.docx', safeDocx)).extension).toBe('.docx');

    const unsafeDocx = makeStoredZip([
      ['[Content_Types].xml', '<Types/>'],
      ['word/document.xml', '<w:document/>'],
      ['word/embeddings/object.bin', 'binary'],
    ]);
    expect(() => validateKnowledgeFile(makeFile('unsafe.docx', unsafeDocx))).toThrow(/嵌入对象/);
  });

  it('allows ordinary web hyperlinks but rejects external non-hyperlink relationships', () => {
    const hyperlink = makeStoredZip([
      ['[Content_Types].xml', '<Types/>'],
      ['word/document.xml', '<w:document/>'],
      ['word/_rels/document.xml.rels', '<Relationships><Relationship Type="http://schemas/hyperlink" Target="https://example.com" TargetMode="External"/></Relationships>'],
    ]);
    expect(() => validateKnowledgeFile(makeFile('linked.docx', hyperlink))).not.toThrow();

    const externalImage = makeStoredZip([
      ['[Content_Types].xml', '<Types/>'],
      ['word/document.xml', '<w:document/>'],
      ['word/_rels/document.xml.rels', '<Relationships><Relationship Type="http://schemas/image" Target="https://example.com/pixel" TargetMode="External"/></Relationships>'],
    ]);
    expect(() => validateKnowledgeFile(makeFile('external.docx', externalImage))).toThrow(/外部关系/);
  });
});

function makeFile(name: string, buffer: Buffer): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'application/octet-stream',
    size: buffer.length,
    buffer,
    destination: '',
    filename: name,
    path: '',
    stream: undefined as any,
  };
}

function makeStoredZip(files: Array<[string, string]>): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const [name, text] of files) {
    const nameBytes = Buffer.from(name);
    const content = Buffer.from(text);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(content.length, 18);
    local.writeUInt32LE(content.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    localParts.push(local, nameBytes, content);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(content.length, 20);
    central.writeUInt32LE(content.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, nameBytes);
    localOffset += local.length + nameBytes.length + content.length;
  }

  const locals = Buffer.concat(localParts);
  const centralDirectory = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(locals.length, 16);
  return Buffer.concat([locals, centralDirectory, eocd]);
}
