import {
  buildAllowedOrigins,
  CorsOriginForbiddenError,
  isOriginAllowed,
  validateCorsOrigin,
} from './cors';

describe('CORS origin policy', () => {
  it('treats localhost loopback aliases as the same local origin', () => {
    const allowed = buildAllowedOrigins(
      'http://localhost:5173,http://localhost:3030',
    );

    expect(isOriginAllowed('http://localhost:5173', allowed)).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:5173', allowed)).toBe(true);
    expect(isOriginAllowed('http://[::1]:5173', allowed)).toBe(true);
  });

  it('does not broaden non-loopback production origins', () => {
    const allowed = buildAllowedOrigins('https://resume.example.com');

    expect(isOriginAllowed('https://resume.example.com', allowed)).toBe(true);
    expect(isOriginAllowed('https://admin.example.com', allowed)).toBe(false);
  });

  it('allows an explicitly configured public IP origin without broadening its scheme', () => {
    const allowed = buildAllowedOrigins('http://203.0.113.10');

    expect(isOriginAllowed('http://203.0.113.10', allowed)).toBe(true);
    expect(isOriginAllowed('https://203.0.113.10', allowed)).toBe(false);
  });

  it('allows server-to-server requests without an Origin header', () => {
    expect(isOriginAllowed(undefined, buildAllowedOrigins())).toBe(true);
  });

  it('returns an HTTP 403 error for a disallowed origin', () => {
    const callback = jest.fn();

    validateCorsOrigin(
      'https://untrusted.example.com',
      buildAllowedOrigins('https://resume.example.com'),
      callback,
    );

    expect(callback).toHaveBeenCalledTimes(1);
    const [error, allow] = callback.mock.calls[0] as [
      CorsOriginForbiddenError,
      boolean | undefined,
    ];
    expect(error).toBeInstanceOf(CorsOriginForbiddenError);
    expect(error.status).toBe(403);
    expect(error.statusCode).toBe(403);
    expect(allow).toBeUndefined();
  });
});
