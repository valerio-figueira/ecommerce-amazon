import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';

describe('API routes', () => {
  let app: ReturnType<typeof Fastify>;

  beforeAll(async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://vitrine:vitrine@localhost:5432/vitrine');
    vi.stubEnv('REDIS_URL', 'redis://localhost:6379');
    vi.stubEnv('TELEMETRY_BUFFER_ENABLED', 'false');

    const { buildServer } = await import('../src/server.js');
    const server = await buildServer();
    app = server.app;
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  it('GET /health returns ok', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns 400 for invalid price alert payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/price-alerts',
      payload: { email: 'invalid', productId: 'not-uuid', targetPrice: -1 },
    });
    expect(response.statusCode).toBe(400);
  });
});
