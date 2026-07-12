import { BadRequestException } from '@nestjs/common';

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
});
