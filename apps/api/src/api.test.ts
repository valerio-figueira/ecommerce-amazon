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

  it('GET /seo/sitemap-meta returns pagination metadata', async () => {
    const response = await app.inject({ method: 'GET', url: '/seo/sitemap-meta' });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      totalEntries: number;
      pageSize: number;
      totalPages: number;
    };
    expect(body.pageSize).toBe(50_000);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(typeof body.totalEntries).toBe('number');
  });

  it('GET /seo/sitemap-entries returns paginated items', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/seo/sitemap-entries?page=1&pageSize=10',
    });
    expect(response.statusCode).toBe(200);
    const body = response.json() as {
      page: number;
      pageSize: number;
      items: Array<{ path: string; lastModified: string }>;
    };
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(Array.isArray(body.items)).toBe(true);
    expect(response.headers['cache-control']).toContain('s-maxage=3600');
  });

  it('returns 400 for invalid sitemap pageSize', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/seo/sitemap-entries?pageSize=999999',
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for comparison with too few products', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/comparisons',
      headers: { 'x-session-id': 'test-session' },
      payload: {
        productIds: ['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'],
        editorialIntro: 'x'.repeat(150),
      },
    });
    expect(response.statusCode).toBe(400);
  });

  it('returns 404 for unknown comparison token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/comparisons/unknown-token-12345',
    });
    expect(response.statusCode).toBe(404);
  });
});
