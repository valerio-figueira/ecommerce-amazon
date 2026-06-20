import { describe, expect, it, vi } from 'vitest';

import type {
  ClickEventRepository,
  EngagementEventRepository,
  TelemetryBufferStore,
} from '@ecommerce-amazon/domain';

import { FlushTelemetryBuffer } from './FlushTelemetryBuffer.js';

function createBufferStoreMock() {
  return {
    drainClicks: vi.fn(),
    drainEngagement: vi.fn(),
    confirmDrainClicks: vi.fn(),
    confirmDrainEngagement: vi.fn(),
    requeueClicks: vi.fn(),
    requeueEngagement: vi.fn(),
  } satisfies Partial<TelemetryBufferStore>;
}

describe('FlushTelemetryBuffer', () => {
  it('flushes click and engagement batches', async () => {
    const bufferStore = createBufferStoreMock();
    bufferStore.drainClicks
      .mockResolvedValueOnce([
        {
          productId: '550e8400-e29b-41d4-a716-446655440000',
          origin: 'embed',
          occurredAt: '2026-06-15T12:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([]);
    bufferStore.drainEngagement
      .mockResolvedValueOnce([
        {
          eventType: 'article_page_view',
          articleId: '660e8400-e29b-41d4-a716-446655440001',
          pagePath: '/artigos/guia',
          occurredAt: '2026-06-15T12:00:00.000Z',
        },
      ])
      .mockResolvedValueOnce([]);

    const clickRepository = {
      recordBatch: vi.fn().mockResolvedValue(undefined),
    } satisfies Pick<ClickEventRepository, 'recordBatch'>;
    const engagementRepository = {
      recordBatch: vi.fn().mockResolvedValue(undefined),
    } satisfies Pick<EngagementEventRepository, 'recordBatch'>;

    const flush = new FlushTelemetryBuffer(
      bufferStore as TelemetryBufferStore,
      clickRepository as ClickEventRepository,
      engagementRepository as EngagementEventRepository,
      5000,
    );

    const result = await flush.execute();

    expect(result).toEqual({ clicksFlushed: 1, engagementFlushed: 1 });
    expect(clickRepository.recordBatch).toHaveBeenCalledOnce();
    expect(engagementRepository.recordBatch).toHaveBeenCalledOnce();
    expect(bufferStore.confirmDrainClicks).toHaveBeenCalledOnce();
    expect(bufferStore.confirmDrainEngagement).toHaveBeenCalledOnce();
  });

  it('requeues clicks when PostgreSQL insert fails', async () => {
    const batch = [
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        origin: 'embed',
        occurredAt: '2026-06-15T12:00:00.000Z',
      },
    ];
    const bufferStore = createBufferStoreMock();
    bufferStore.drainClicks.mockResolvedValueOnce(batch).mockResolvedValueOnce([]);
    bufferStore.drainEngagement.mockResolvedValueOnce([]);

    const clickRepository = {
      recordBatch: vi.fn().mockRejectedValue(new Error('db down')),
    } satisfies Pick<ClickEventRepository, 'recordBatch'>;
    const engagementRepository = {
      recordBatch: vi.fn(),
    } satisfies Pick<EngagementEventRepository, 'recordBatch'>;

    const flush = new FlushTelemetryBuffer(
      bufferStore as TelemetryBufferStore,
      clickRepository as ClickEventRepository,
      engagementRepository as EngagementEventRepository,
      5000,
    );

    await expect(flush.execute()).rejects.toThrow('Failed to flush click telemetry batch');
    expect(bufferStore.requeueClicks).toHaveBeenCalledWith(batch);
    expect(bufferStore.confirmDrainClicks).not.toHaveBeenCalled();
  });
});
