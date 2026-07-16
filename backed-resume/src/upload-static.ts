import * as express from 'express';
import type { RequestHandler } from 'express';
import { resolveLocalUploadRoot } from '../modules/storage/local-storage-path';
import { isPrivateKnowledgeUploadPath } from './security/upload-static-access';

/**
 * Build the /uploads middleware stack from the same UPLOAD_PATH resolver used
 * by StorageService. This prevents successful writes to one directory while
 * Express serves a different directory.
 */
export function createUploadStaticHandlers(): RequestHandler[] {
  return [
    (req, res, next) => {
      if (isPrivateKnowledgeUploadPath(req.url || req.path)) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(404).end();
      }
      return next();
    },
    express.static(resolveLocalUploadRoot(), {
      fallthrough: true,
      index: false,
      redirect: false,
      setHeaders: (res, filePath) => {
        if (filePath.includes('resume-photos')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        res.setHeader('X-Content-Type-Options', 'nosniff');
      },
    }),
  ];
}
