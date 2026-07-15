import { ConflictException } from '@nestjs/common';
import { KnowledgeController } from './knowledge.controller';

jest.mock('../storage/storage.service', () => ({
  StorageService: class StorageService {},
}));

describe('KnowledgeController mutation conflicts', () => {
  it('propagates a reindex conflict as HTTP 409', async () => {
    const service = {
      reindex: jest
        .fn()
        .mockRejectedValue(
          new ConflictException('document mutation already in progress'),
        ),
    };
    const controller = new KnowledgeController(service as any);

    await expect(
      controller.reindex({ user: { id: 1, type: 'admin' } }, 85),
    ).rejects.toMatchObject({ status: 409 });
  });
});
