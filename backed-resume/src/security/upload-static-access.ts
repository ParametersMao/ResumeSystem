export function isPrivateKnowledgeUploadPath(requestPath: string): boolean {
  let decoded = String(requestPath || '');
  try {
    // Decode twice so double-encoded separators cannot bypass the private prefix.
    decoded = decodeURIComponent(decodeURIComponent(decoded));
  } catch {
    return true;
  }
  const normalized = decoded.replace(/\\/g, '/').replace(/^\/+/, '').toLowerCase();
  const firstSegment = normalized.split('/')[0];
  return firstSegment === 'knowledge';
}
