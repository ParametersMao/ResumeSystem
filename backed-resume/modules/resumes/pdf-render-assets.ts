import type { HTTPRequest } from 'puppeteer';

const PDF_ASSET_BASE_URL = 'http://127.0.0.1:3000/';
const RESUME_PHOTO_PATH_MARKER = '/resume-photos/';

export interface PdfAssetStorage {
  downloadObject(key: string): Promise<Buffer>;
}

interface ResumePhotoResource {
  key: string;
  ownerId: number;
  contentType: string;
}

/**
 * Serve resume photos directly from the configured storage provider to the
 * isolated Chromium page. This deliberately avoids routing an uploaded photo
 * back through the public domain/IP (which may be blocked by request policy,
 * TLS certificate validation, DNS, or a container hairpin route).
 */
export async function handlePdfResourceRequest(
  request: HTTPRequest,
  storage: PdfAssetStorage,
  userId: number,
): Promise<void> {
  const rawUrl = request.url();
  const photo = parseResumePhotoResource(rawUrl);

  if (photo) {
    if (request.resourceType() !== 'image' || photo.ownerId !== userId) {
      await request.abort('blockedbyclient');
      return;
    }

    const body = await storage.downloadObject(photo.key);
    await request.respond({
      status: 200,
      contentType: photo.contentType,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Length': String(body.length),
      },
      body,
    });
    return;
  }

  if (isAllowedPdfResourceUrl(rawUrl, request.resourceType())) {
    await request.continue();
    return;
  }

  await request.abort('blockedbyclient');
}

export function isAllowedPdfResourceUrl(
  rawUrl: string,
  resourceType: string,
): boolean {
  if (!rawUrl) return true;
  if (resourceType === 'document') {
    return /^(about:blank|data:text\/html(?:[;,]))/i.test(rawUrl);
  }
  if (/^(about:blank|data:|blob:)/i.test(rawUrl)) return true;

  try {
    const url = new URL(rawUrl);
    if (!['127.0.0.1', 'localhost', '::1'].includes(url.hostname)) {
      return false;
    }

    return (
      url.pathname.startsWith('/uploads/') ||
      url.pathname.startsWith('/mock/') ||
      url.pathname.startsWith('/assets/') ||
      url.pathname === '/favicon.ico'
    );
  } catch {
    return false;
  }
}

export function parseResumePhotoResource(
  rawUrl: string,
): ResumePhotoResource | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(rawUrl, PDF_ASSET_BASE_URL).pathname);
  } catch {
    return null;
  }

  const markerIndex = pathname.indexOf(RESUME_PHOTO_PATH_MARKER);
  if (markerIndex < 0) return null;

  const key = pathname.slice(markerIndex + 1);
  const match =
    /^resume-photos\/user-(\d+)\/([a-zA-Z0-9][a-zA-Z0-9._-]{0,220})\.(png|jpe?g|webp)$/i.exec(
      key,
    );
  if (!match) return null;

  const ownerId = Number(match[1]);
  if (!Number.isSafeInteger(ownerId) || ownerId < 1) return null;

  const extension = match[3].toLowerCase();
  return {
    key,
    ownerId,
    contentType:
      extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : `image/${extension}`,
  };
}

/**
 * Executed inside Chromium. A completed image can still be a failed image, so
 * natural dimensions and decode() are both required before PDF generation.
 */
export async function waitForPdfAssets(
  timeoutMs: number,
): Promise<{ imageCount: number }> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () =>
        reject(
          new Error('PDF assets did not finish loading before the deadline'),
        ),
      timeoutMs,
    );
  });

  const waitForAssets = async () => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      await fonts.ready.catch(() => undefined);
    }

    const images = Array.from(document.images || []);
    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve, reject) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener(
              'error',
              () => reject(new Error('A PDF image failed to load')),
              { once: true },
            );
          });
        }

        if (!image.naturalWidth || !image.naturalHeight) {
          throw new Error('A PDF image loaded without drawable content');
        }

        if (typeof image.decode === 'function') {
          await image.decode();
        }

        if (!image.naturalWidth || !image.naturalHeight) {
          throw new Error('A PDF image could not be decoded');
        }
      }),
    );

    return { imageCount: images.length };
  };

  try {
    return await Promise.race([waitForAssets(), timeout]);
  } finally {
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  }
}
