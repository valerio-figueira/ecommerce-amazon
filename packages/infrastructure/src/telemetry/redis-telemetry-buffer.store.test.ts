import { describe, expect, it, vi } from 'vitest';

import { ClickOrigin } from '@ecommerce-amazon/domain';

import { RedisTelemetryBufferStore, formatTelemetryDay } from './redis-telemetry-buffer.store.js';

type PipelineMock = {
  lpush: ReturnType<typeof vi.fn>;
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  exec: ReturnType<typeof vi.fn>;
};

function createRedisMock() {
  const counters = new Map<string, number>();
  const lists = new Map<string, string[]>();

  const pipeline: PipelineMock & { hset: ReturnType<typeof vi.fn> } = {
    lpush: vi.fn((key: string, value: string) => {
      const list = lists.get(key) ?? [];
      list.unshift(value);
      lists.set(key, list);
    }),
    incr: vi.fn((key: string) => {
      counters.set(key, (counters.get(key) ?? 0) + 1);
    }),
    expire: vi.fn(),
    hset: vi.fn(),
    exec: vi.fn().mockResolvedValue([]),
  };

  const redis = {
    pipeline: vi.fn(() => pipeline),
    ltrim: vi.fn(),
    lmove: vi.fn(async (source: string, destination: string) => {
      const sourceList = lists.get(source) ?? [];
      if (sourceList.length === 0) return null;
      const value = sourceList.pop() ?? null;
      if (value === null) return null;
      lists.set(source, sourceList);
      const destinationList = lists.get(destination) ?? [];
      destinationList.unshift(value);
      lists.set(destination, destinationList);
      return value;
    }),
    get: vi.fn(async (key: string) => String(counters.get(key) ?? 0)),
    mget: vi.fn(async (...keys: string[]) => keys.map((key) => String(counters.get(key) ?? 0))),
    scan: vi.fn(async () => ['0', []]),
    del: vi.fn(async (key: string) => {
      lists.delete(key);
      return 1;
    }),
    decr: vi.fn((key: string) => {
      counters.set(key, Math.max(0, (counters.get(key) ?? 0) - 1));
    }),
    hset: vi.fn(),
    hgetall: vi.fn(async () => ({})),
  };

  return { redis, pipeline, counters, lists };
}

describe('RedisTelemetryBufferStore', () => {
  it('increments pending counters when pushing a click', async () => {
    const { redis, pipeline, counters } = createRedisMock();
    const store = new RedisTelemetryBufferStore(redis as never, 1000);
    const occurredAt = '2026-06-15T10:00:00.000Z';

    await store.pushClick({
      productId: '550e8400-e29b-41d4-a716-446655440000',
      origin: ClickOrigin.EMBED,
      articleId: '660e8400-e29b-41d4-a716-446655440001',
      placement: 'article.embed',
      pagePath: '/artigos/guia',
      occurredAt,
    });

    expect(pipeline.lpush).toHaveBeenCalled();
    const day = formatTelemetryDay(new Date(occurredAt));
    expect(counters.get(`telemetry:pending:clicks:day:${day}:total`)).toBe(1);
    expect(counters.get(`telemetry:pending:events:day:${day}:total`)).toBe(1);
    expect(counters.get(`telemetry:pending:clicks:day:${day}:origin:${ClickOrigin.EMBED}`)).toBe(1);
  });

  it('drains clicks into processing list', async () => {
    const { redis, lists } = createRedisMock();
    lists.set('telemetry:buffer:clicks', [
      JSON.stringify({
        productId: '550e8400-e29b-41d4-a716-446655440000',
        origin: 'embed',
        occurredAt: '2026-06-15T10:00:00.000Z',
      }),
    ]);

    const store = new RedisTelemetryBufferStore(redis as never, 1000);
    const drained = await store.drainClicks(10);

    expect(drained).toHaveLength(1);
    expect(lists.get('telemetry:buffer:clicks')).toEqual([]);
    expect(lists.get('telemetry:buffer:clicks:processing')).toHaveLength(1);
  });
});
