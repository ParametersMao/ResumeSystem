import { BadRequestException, NotFoundException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

jest.mock('../storage/storage.service', () => ({ StorageService: class StorageService {} }));

describe('KnowledgeService v1.3 boundaries', () => {
  let knowledgeRepository: any;
  let resumeRepository: any;
  let storageService: any;
  let agentClient: any;
  let service: KnowledgeService;

  beforeEach(() => {
    knowledgeRepository = {
      create: jest.fn((value) => ({ ...value })),
      save: jest.fn(async (value) => ({ ...value, id: value.id || 102 })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
    };
    resumeRepository = {
      findOne: jest.fn().mockResolvedValue({ id: 8, userId: 11, status: 1 }),
    };
    storageService = {
      uploadObject: jest.fn().mockResolvedValue({
        key: 'knowledge/private/new.txt',
        url: '/uploads/knowledge/private/new.txt',
      }),
      deleteObject: jest.fn().mockResolvedValue(undefined),
      downloadObject: jest.fn(),
    };
    agentClient = {
      indexDocument: jest.fn().mockResolvedValue({ chunk_count: 2 }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
      setDocumentEnabled: jest.fn().mockResolvedValue(undefined),
      search: jest.fn(),
      getMetrics: jest.fn(),
    };
    service = new KnowledgeService(
      knowledgeRepository,
      resumeRepository,
      storageService,
      agentClient,
    );
    (service as any).ensureTablePromise = Promise.resolve();
  });

  it.each([
    { licensed: false, piiReviewed: true },
    { licensed: true, piiReviewed: false },
    { licensed: false, piiReviewed: false },
  ])('rejects a resume exemplar without both compliance gates: %o', async (flags) => {
    await expect(
      service.upload({
        file: textFile('exemplar.md', '# anonymized exemplar'),
        sourceType: 'resume-exemplar',
        adminId: 1,
        ...flags,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storageService.uploadObject).not.toHaveBeenCalled();
    expect(agentClient.indexDocument).not.toHaveBeenCalled();
  });

  it('passes licensed and PII-reviewed exemplar metadata to the Agent', async () => {
    await service.upload({
      file: textFile('exemplar.md', '# anonymized exemplar'),
      sourceType: 'resume-exemplar',
      licensed: true,
      piiReviewed: true,
      adminId: 1,
    });

    expect(agentClient.indexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'resume-exemplar',
        scope: 'global',
        ownerUserId: null,
        resumeId: null,
        licensed: true,
        piiReviewed: true,
      }),
    );
  });

  it('fails closed when another tenant targets a resume they do not own', async () => {
    resumeRepository.findOne.mockResolvedValue(null);

    await expect(service.getJobDescription(8, 99)).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.replaceJobDescription({ resumeId: 8, ownerUserId: 99, text: 'private JD' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.deleteJobDescription(8, 99)).rejects.toBeInstanceOf(NotFoundException);

    expect(resumeRepository.findOne).toHaveBeenCalledWith({
      where: { id: 8, userId: 99, status: 1 },
    });
    expect(knowledgeRepository.find).not.toHaveBeenCalled();
    expect(agentClient.deleteDocument).not.toHaveBeenCalled();
  });

  it('keeps the old JD source and vectors when replacement indexing fails', async () => {
    const oldDocument = {
      id: 41,
      sourceType: 'job-description',
      scope: 'private',
      ownerUserId: 11,
      resumeId: 8,
      status: 'ready',
      enabled: true,
      storageKey: 'knowledge/private/old.txt',
      storageUrl: '/uploads/knowledge/private/old.txt',
      updateTime: new Date('2026-07-12T00:00:00Z'),
    };
    knowledgeRepository.find.mockResolvedValue([oldDocument]);
    agentClient.indexDocument.mockRejectedValue(new Error('embedding unavailable'));

    const result = await service.replaceJobDescription({
      resumeId: 8,
      ownerUserId: 11,
      text: 'Senior backend engineer with Node.js and distributed systems experience.',
    });

    expect(result.status).toBe('failed');
    expect(agentClient.indexDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceType: 'job-description',
        scope: 'private',
        ownerUserId: 11,
        resumeId: 8,
      }),
    );
    expect(agentClient.deleteDocument).not.toHaveBeenCalled();
    expect(storageService.deleteObject).not.toHaveBeenCalled();
    expect(knowledgeRepository.remove).not.toHaveBeenCalled();
  });

  it('purges expired private JD source files, vectors and metadata', async () => {
    knowledgeRepository.find.mockResolvedValue([{
      id: 71,
      scope: 'private',
      sourceType: 'job-description',
      ownerUserId: 11,
      resumeId: 8,
      storageKey: 'knowledge/private/expired.txt',
      expiresAt: new Date('2026-07-01T00:00:00Z'),
    }]);

    const count = await service.purgeExpiredPrivateDocuments(
      new Date('2026-07-13T00:00:00Z'),
    );

    expect(count).toBe(1);
    expect(agentClient.deleteDocument).toHaveBeenCalledWith(71);
    expect(storageService.deleteObject).toHaveBeenCalledWith('knowledge/private/expired.txt');
    expect(knowledgeRepository.remove).toHaveBeenCalled();
  });

  it('serializes tinyint compliance and enabled fields as JSON booleans', () => {
    const metadata = (service as any).toMetadata({
      id: 1,
      storageKey: 'knowledge/global/standard.md',
      storageUrl: '/uploads/knowledge/global/standard.md',
      enabled: 1,
      licensed: 0,
      piiReviewed: 1,
    });

    expect(metadata).toEqual(expect.objectContaining({
      enabled: true,
      licensed: false,
      piiReviewed: true,
    }));
    expect(metadata).not.toHaveProperty('storageKey');
    expect(metadata).not.toHaveProperty('storageUrl');
  });
});

function textFile(name: string, text: string): Express.Multer.File {
  const buffer = Buffer.from(text);
  return {
    fieldname: 'file',
    originalname: name,
    encoding: '7bit',
    mimetype: 'text/plain',
    size: buffer.length,
    buffer,
  } as Express.Multer.File;
}
