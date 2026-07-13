const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function buildAllowedOrigins(value?: string): Set<string> {
  const configured = (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const allowed = new Set(configured);

  for (const origin of configured) {
    try {
      const url = new URL(origin);
      if (!LOOPBACK_HOSTS.has(url.hostname)) continue;

      for (const hostname of LOOPBACK_HOSTS) {
        const host = hostname === '[::1]' ? hostname : hostname;
        allowed.add(`${url.protocol}//${host}${url.port ? `:${url.port}` : ''}`);
      }
    } catch {
      // Invalid entries remain unmatched and are therefore never allowed.
    }
  }

  return allowed;
}

export function isOriginAllowed(origin: string | undefined, allowedOrigins: Set<string>): boolean {
  return !origin || allowedOrigins.has(origin.replace(/\/$/, ''));
}
