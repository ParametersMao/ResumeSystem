import { buildAllowedOrigins, isOriginAllowed } from './cors';

describe('CORS origin policy', () => {
  it('treats localhost loopback aliases as the same local origin', () => {
    const allowed = buildAllowedOrigins('http://localhost:5173,http://localhost:3030');

    expect(isOriginAllowed('http://localhost:5173', allowed)).toBe(true);
    expect(isOriginAllowed('http://127.0.0.1:5173', allowed)).toBe(true);
    expect(isOriginAllowed('http://[::1]:5173', allowed)).toBe(true);
  });

  it('does not broaden non-loopback production origins', () => {
    const allowed = buildAllowedOrigins('https://resume.example.com');

    expect(isOriginAllowed('https://resume.example.com', allowed)).toBe(true);
    expect(isOriginAllowed('https://admin.example.com', allowed)).toBe(false);
  });

  it('allows server-to-server requests without an Origin header', () => {
    expect(isOriginAllowed(undefined, buildAllowedOrigins())).toBe(true);
  });
});
