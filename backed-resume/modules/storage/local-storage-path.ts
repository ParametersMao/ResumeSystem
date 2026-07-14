import { resolve, sep } from 'path';

export function resolveLocalUploadRoot(
  uploadPath = process.env.UPLOAD_PATH || './uploads',
): string {
  return resolve(process.cwd(), uploadPath);
}

export function resolveLocalObjectPath(key: string): string {
  const root = resolveLocalUploadRoot();
  const target = resolve(root, key);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error('Invalid object key path');
  }
  return target;
}
