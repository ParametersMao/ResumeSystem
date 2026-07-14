import type { HTTPRequest } from 'puppeteer';
import {
  handlePdfResourceRequest,
  isAllowedPdfResourceUrl,
  parseResumePhotoResource,
  waitForPdfAssets,
} from './pdf-render-assets';

function makeRequest(url: string, resourceType = 'image') {
  return {
    url: jest.fn(() => url),
    resourceType: jest.fn(() => resourceType),
    respond: jest.fn().mockResolvedValue(undefined),
    continue: jest.fn().mockResolvedValue(undefined),
    abort: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<HTTPRequest>;
}

describe('PDF image resource handling', () => {
  it.each([
    '/uploads/resume-photos/user-7/photo-1-avatar.png',
    'https://121.43.208.184/uploads/resume-photos/user-7/photo-1-avatar.png',
    'https://cdn.example.test/resume-photos/user-7/photo-1-avatar.png',
  ])(
    'loads an owned resume photo from storage instead of the public URL: %s',
    async (url) => {
      const request = makeRequest(url);
      const image = Buffer.from('verified image bytes');
      const storage = { downloadObject: jest.fn().mockResolvedValue(image) };

      await handlePdfResourceRequest(request, storage, 7);

      expect(storage.downloadObject).toHaveBeenCalledWith(
        'resume-photos/user-7/photo-1-avatar.png',
      );
      expect(request.respond).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 200,
          contentType: 'image/png',
          body: image,
        }),
      );
      expect(request.continue).not.toHaveBeenCalled();
      expect(request.abort).not.toHaveBeenCalled();
    },
  );

  it('blocks a resume photo belonging to another user before reading storage', async () => {
    const request = makeRequest(
      'https://121.43.208.184/uploads/resume-photos/user-8/photo-avatar.webp',
    );
    const storage = { downloadObject: jest.fn() };

    await handlePdfResourceRequest(request, storage, 7);

    expect(storage.downloadObject).not.toHaveBeenCalled();
    expect(request.abort).toHaveBeenCalledWith('blockedbyclient');
    expect(request.respond).not.toHaveBeenCalled();
  });

  it('keeps data images and local static template assets available', async () => {
    const storage = { downloadObject: jest.fn() };
    const dataImage = makeRequest('data:image/png;base64,AAAA');
    const localAsset = makeRequest(
      'http://127.0.0.1:3000/mock/avatar/default.svg',
    );

    await handlePdfResourceRequest(dataImage, storage, 7);
    await handlePdfResourceRequest(localAsset, storage, 7);

    expect(dataImage.continue).toHaveBeenCalledTimes(1);
    expect(localAsset.continue).toHaveBeenCalledTimes(1);
    expect(storage.downloadObject).not.toHaveBeenCalled();
  });

  it('blocks unrelated external requests from user supplied export HTML', async () => {
    const request = makeRequest('https://example.test/tracker.png');
    const storage = { downloadObject: jest.fn() };

    await handlePdfResourceRequest(request, storage, 7);

    expect(request.abort).toHaveBeenCalledWith('blockedbyclient');
    expect(request.continue).not.toHaveBeenCalled();
  });

  it('blocks nested external documents instead of creating an iframe SSRF escape', async () => {
    const request = makeRequest('https://example.test/private', 'document');
    const storage = { downloadObject: jest.fn() };

    await handlePdfResourceRequest(request, storage, 7);

    expect(request.abort).toHaveBeenCalledWith('blockedbyclient');
    expect(request.continue).not.toHaveBeenCalled();
  });

  it('parses the storage key and image media type without trusting its origin', () => {
    expect(
      parseResumePhotoResource(
        'https://assets.example.test/prefix/resume-photos/user-23/photo-final.jpeg?version=1',
      ),
    ).toEqual({
      key: 'resume-photos/user-23/photo-final.jpeg',
      ownerId: 23,
      contentType: 'image/jpeg',
    });
    expect(
      parseResumePhotoResource(
        'https://example.test/uploads/knowledge/private/a.png',
      ),
    ).toBeNull();
  });

  it('allows only loopback-hosted static resources outside uploaded photos', () => {
    expect(
      isAllowedPdfResourceUrl(
        'http://127.0.0.1:3000/mock/avatar/default.svg',
        'image',
      ),
    ).toBe(true);
    expect(
      isAllowedPdfResourceUrl(
        'https://121.43.208.184/mock/avatar/default.svg',
        'image',
      ),
    ).toBe(false);
  });
});

describe('PDF image readiness checks', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    'document',
  );

  afterEach(() => {
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
      Reflect.deleteProperty(globalThis, 'document');
    }
  });

  it('waits for browser decoding before reporting an image as ready', async () => {
    const decode = jest.fn().mockResolvedValue(undefined);
    setFakeDocument([
      { complete: true, naturalWidth: 32, naturalHeight: 40, decode },
    ]);

    await expect(waitForPdfAssets(1_000)).resolves.toEqual({ imageCount: 1 });
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it('rejects complete-but-broken images instead of silently exporting them', async () => {
    setFakeDocument([
      { complete: true, naturalWidth: 0, naturalHeight: 0, decode: jest.fn() },
    ]);

    await expect(waitForPdfAssets(1_000)).rejects.toThrow(
      'loaded without drawable content',
    );
  });
});

function setFakeDocument(images: unknown[]) {
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      fonts: { ready: Promise.resolve() },
      images,
    },
  });
}
