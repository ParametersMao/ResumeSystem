import { KnowledgeAgentClientService } from './knowledge-agent-client.service';
import { ConflictException } from '@nestjs/common';

describe('KnowledgeAgentClientService metadata contract', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.AGENT_SERVICE_URL = 'http://agent:8000';
    process.env.AGENT_INTERNAL_SECRET = 'internal-test-secret';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.AGENT_SERVICE_URL;
    delete process.env.AGENT_INTERNAL_SECRET;
    delete process.env.KNOWLEDGE_AGENT_REQUEST_TIMEOUT_MS;
    jest.restoreAllMocks();
  });

  it('sends all tenant and compliance metadata to /rag/index', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          document_id: 7,
          chunk_count: 2,
          embedding_backend: 'fastembed',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    global.fetch = fetchMock as any;
    const service = new KnowledgeAgentClientService();
    const fileBuffer = Buffer.from('job description');

    await service.indexDocument({
      documentId: 7,
      name: 'Private JD',
      category: 'job-description',
      sourceType: 'job-description',
      scope: 'private',
      ownerUserId: 11,
      resumeId: 8,
      licensed: false,
      piiReviewed: false,
      expiresAt: new Date('2026-08-01T00:00:00Z'),
      enabled: false,
      file: {
        originalname: 'jd.txt',
        mimetype: 'text/plain',
        buffer: fileBuffer,
      } as Express.Multer.File,
    });

    const [url, init] = fetchMock.mock.calls[0];
    const form = init.body as FormData;
    expect(url).toBe('http://agent:8000/rag/index');
    expect(form.get('source_type')).toBe('job-description');
    expect(form.get('scope')).toBe('private');
    expect(form.get('owner_user_id')).toBe('11');
    expect(form.get('resume_id')).toBe('8');
    expect(form.get('licensed')).toBe('false');
    expect(form.get('pii_reviewed')).toBe('false');
    expect(form.get('expires_at')).toBe('2026-08-01T00:00:00.000Z');
    expect(form.get('enabled')).toBe('false');
  });

  it('sends source and tenant filters to /rag/search', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    global.fetch = fetchMock as any;
    const service = new KnowledgeAgentClientService();

    await service.search('Node.js', 5, 'backend', {
      sourceTypes: ['standard', 'job-description'],
      scope: 'private',
      ownerUserId: 11,
      resumeId: 8,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init.body))).toEqual({
      query: 'Node.js',
      limit: 5,
      category: 'backend',
      sourceTypes: ['standard', 'job-description'],
      scope: 'private',
      ownerUserId: 11,
      resumeId: '8',
    });
  });

  it('uses the configurable cold-start timeout and clamps it to the safe range', async () => {
    process.env.KNOWLEDGE_AGENT_REQUEST_TIMEOUT_MS = '900000';
    const timeoutSpy = jest.spyOn(global, 'setTimeout');
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          document_id: 9,
          chunk_count: 1,
          embedding_backend: 'fastembed',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    ) as any;

    await new KnowledgeAgentClientService().indexDocument({
      documentId: 9,
      name: 'Cold start',
      category: 'resume-standard',
      sourceType: 'standard',
      scope: 'global',
      file: {
        originalname: 'standard.md',
        mimetype: 'text/markdown',
        buffer: Buffer.from('standard'),
      } as Express.Multer.File,
    });

    expect(timeoutSpy.mock.calls.some(([, delay]) => delay === 600_000)).toBe(
      true,
    );
  });

  it('surfaces a document mutation conflict as HTTP 409 instead of a gateway failure', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: 'document 7 already has a mutation in progress',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    ) as any;

    await expect(
      new KnowledgeAgentClientService().deleteDocument(7),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
