import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('puppeteer', () => ({}));
jest.mock('../storage/storage.service', () => ({ StorageService: class StorageService {} }));
jest.mock('../entitlements/entitlements.service', () => ({ EntitlementsService: class EntitlementsService {} }));

import { injectPdfSafeMargins, ResumesService } from './resumes.service';

describe('ResumesService validation', () => {
  let service: ResumesService;

  beforeEach(() => {
    service = new ResumesService(
      {} as any,
      {} as any,
      { exists: jest.fn().mockResolvedValue(false) } as any,
      {} as any,
      {
        assertCanCreateResume: jest.fn(),
        assertDatabaseStorageAvailable: jest.fn(),
      } as any,
      { deleteJobDescription: jest.fn().mockResolvedValue(undefined) } as any,
    );
  });

  it('rejects invalid resume JSON before creating a resume', async () => {
    await expect(
      service.create({ title: 'Bad resume', content: '{bad-json' }, 1),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects oversized export HTML before consuming PDF quota', async () => {
    await expect(service.exportPdf('x'.repeat(2 * 1024 * 1024 + 1), 1)).rejects.toThrow(BadRequestException);
  });

  it('drops a stale template id instead of violating the resume foreign key', async () => {
    await expect((service as any).resolveTemplateId(24)).resolves.toBeNull();
  });

  it('keeps long modules naturally pageable while preventing individual items from splitting', () => {
    const html = injectPdfSafeMargins('<html><head></head><body><section class="resume-section"></section></body></html>');
    expect(html).toContain('.resume-section,');
    expect(html).toContain('break-inside: auto !important');
    expect(html).toContain('.section-item,');
    expect(html).toContain('break-inside: avoid !important');
    expect(html).toContain('.student-section-heading,');
    expect(html).toContain('break-after: avoid !important');
  });

  it('does not let an in-flight update resurrect a concurrently deleted resume', async () => {
    const resume = {
      id: 8,
      userId: 11,
      status: 1,
      version: 3,
      content: '{"profile":{}}',
      previewImage: '',
    };
    const repository = (service as any).resumeRepository;
    repository.findOne = jest
      .fn()
      .mockResolvedValueOnce(resume)
      .mockResolvedValueOnce({ id: 8, status: 0, version: 3 });
    repository.update = jest.fn().mockResolvedValue({ affected: 0 });
    repository.save = jest.fn();
    jest.spyOn(service as any, 'saveVersionSnapshot').mockResolvedValue(undefined);

    await expect(
      service.update(8, { title: 'Updated title', version: 3 }, 11),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.update).toHaveBeenCalledWith(
      { id: 8, userId: 11, status: 1, version: 3 },
      { title: 'Updated title', version: 4 },
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('does not let an in-flight rollback resurrect a concurrently deleted resume', async () => {
    const resume = {
      id: 8,
      userId: 11,
      status: 1,
      version: 3,
      content: '{"current":true}',
      previewImage: '',
    };
    const repository = (service as any).resumeRepository;
    repository.findOne = jest
      .fn()
      .mockResolvedValueOnce(resume)
      .mockResolvedValueOnce({ id: 8, status: 0, version: 3 });
    repository.update = jest.fn().mockResolvedValue({ affected: 0 });
    repository.save = jest.fn();
    jest
      .spyOn(service as any, 'findVersionSnapshot')
      .mockResolvedValue({ id: 4, resumeId: 8, userId: 11, content: '{"old":true}' });
    jest.spyOn(service as any, 'saveVersionSnapshot').mockResolvedValue(undefined);

    await expect(service.rollback(8, 4, 11)).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.update).toHaveBeenCalledWith(
      { id: 8, userId: 11, status: 1, version: 3 },
      { content: '{"old":true}', version: 4 },
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('reports an active concurrent update as a version conflict', async () => {
    const resume = {
      id: 8,
      userId: 11,
      status: 1,
      version: 3,
      content: '{"profile":{}}',
      previewImage: '',
    };
    const repository = (service as any).resumeRepository;
    repository.findOne = jest
      .fn()
      .mockResolvedValueOnce(resume)
      .mockResolvedValueOnce({ id: 8, status: 1, version: 4 });
    repository.update = jest.fn().mockResolvedValue({ affected: 0 });
    jest.spyOn(service as any, 'saveVersionSnapshot').mockResolvedValue(undefined);

    await expect(
      service.update(8, { title: 'Updated title', version: 3 }, 11),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('cleans private JD resources before marking a resume deleted', async () => {
    const resume = { id: 8, userId: 11, status: 1 };
    const repository = (service as any).resumeRepository;
    const knowledge = (service as any).knowledgeService;
    repository.findOne = jest.fn().mockResolvedValue(resume);
    repository.update = jest.fn().mockResolvedValue({ affected: 1 });

    await service.remove(8, 11);

    expect(knowledge.deleteJobDescription).toHaveBeenCalledWith(8, 11);
    expect(repository.update).toHaveBeenCalledWith(
      { id: 8, userId: 11, status: 1 },
      { status: 0 },
    );
    expect(knowledge.deleteJobDescription.mock.invocationCallOrder[0]).toBeLessThan(
      repository.update.mock.invocationCallOrder[0],
    );
  });

  it('treats a repeated delete of the caller owned soft-deleted resume as success', async () => {
    const repository = (service as any).resumeRepository;
    const knowledge = (service as any).knowledgeService;
    repository.findOne = jest.fn().mockResolvedValue({ id: 8, userId: 11, status: 0 });
    repository.update = jest.fn();

    await expect(service.remove(8, 11)).resolves.toBeUndefined();

    expect(knowledge.deleteJobDescription).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not make a missing or foreign resume idempotently deletable', async () => {
    const repository = (service as any).resumeRepository;
    const knowledge = (service as any).knowledgeService;
    repository.findOne = jest.fn().mockResolvedValue(null);
    repository.update = jest.fn();

    await expect(service.remove(8, 11)).rejects.toBeInstanceOf(NotFoundException);

    expect(knowledge.deleteJobDescription).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('accepts a concurrent owner delete when the conditional update loses the race', async () => {
    const repository = (service as any).resumeRepository;
    repository.findOne = jest.fn().mockResolvedValue({ id: 8, userId: 11, status: 1 });
    repository.update = jest.fn().mockResolvedValue({ affected: 0 });
    repository.exists = jest.fn().mockResolvedValue(true);

    await expect(service.remove(8, 11)).resolves.toBeUndefined();

    expect(repository.exists).toHaveBeenCalledWith({
      where: { id: 8, userId: 11, status: 0 },
    });
  });

  it('rejects a failed conditional delete unless the owner row is already deleted', async () => {
    const repository = (service as any).resumeRepository;
    repository.findOne = jest.fn().mockResolvedValue({ id: 8, userId: 11, status: 1 });
    repository.update = jest.fn().mockResolvedValue({ affected: 0 });
    repository.exists = jest.fn().mockResolvedValue(false);

    await expect(service.remove(8, 11)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not delete a resume when private JD cleanup fails', async () => {
    const resume = { id: 8, userId: 11, status: 1 };
    const repository = (service as any).resumeRepository;
    const knowledge = (service as any).knowledgeService;
    repository.findOne = jest.fn().mockResolvedValue(resume);
    repository.update = jest.fn();
    knowledge.deleteJobDescription.mockRejectedValueOnce(new Error('qdrant unavailable'));

    await expect(service.remove(8, 11)).rejects.toThrow('qdrant unavailable');
    expect(repository.update).not.toHaveBeenCalled();
    expect(resume.status).toBe(1);
  });
});
