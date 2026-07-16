import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { buildAllowedOrigins, validateCorsOrigin } from '../src/cors';

@Controller('cors-probe')
class CorsProbeController {
  @Get()
  getProbe() {
    return { ok: true };
  }
}

describe('CORS policy (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CorsProbeController],
    }).compile();

    app = moduleFixture.createNestApplication({ logger: false });
    const allowedOrigins = buildAllowedOrigins('http://203.0.113.10');
    app.enableCors({
      origin: (origin, callback) =>
        validateCorsOrigin(origin, allowedOrigins, callback),
      credentials: true,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows an explicitly configured public IP origin', async () => {
    await request(app.getHttpServer())
      .get('/cors-probe')
      .set('Origin', 'http://203.0.113.10')
      .expect('Access-Control-Allow-Origin', 'http://203.0.113.10')
      .expect(200, { ok: true });
  });

  it('allows browser preflight from an explicitly configured public IP origin', async () => {
    await request(app.getHttpServer())
      .options('/cors-probe')
      .set('Origin', 'http://203.0.113.10')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect('Access-Control-Allow-Origin', 'http://203.0.113.10')
      .expect(204);
  });

  it('rejects an unconfigured origin with HTTP 403 instead of 500', async () => {
    await request(app.getHttpServer())
      .get('/cors-probe')
      .set('Origin', 'https://untrusted.example.com')
      .expect(403, {
        statusCode: 403,
        message: 'CORS: origin https://untrusted.example.com not allowed',
      });
  });

  it('rejects browser preflight from an unconfigured origin with HTTP 403', async () => {
    await request(app.getHttpServer())
      .options('/cors-probe')
      .set('Origin', 'https://untrusted.example.com')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(403);
  });
});
