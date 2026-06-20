import type {
  ClickEventRepository,
  EngagementEventRepository,
  TelemetryBufferStore,
} from '@ecommerce-amazon/domain';

export class RedisBufferedClickEventRepository implements ClickEventRepository {
  constructor(private readonly bufferStore: TelemetryBufferStore) {}

  async record(event: {
    productId: string;
    origin: string;
    marketplace?: string;
    sessionId?: string;
    blockId?: string;
    articleId?: string;
    collectionId?: string;
    placement?: string;
    pagePath?: string;
    referrerPath?: string;
    occurredAt: Date;
  }): Promise<void> {
    await this.bufferStore.pushClick({
      productId: event.productId,
      origin: event.origin,
      ...(event.marketplace !== undefined ? { marketplace: event.marketplace } : {}),
      ...(event.sessionId !== undefined ? { sessionId: event.sessionId } : {}),
      ...(event.blockId !== undefined ? { blockId: event.blockId } : {}),
      ...(event.articleId !== undefined ? { articleId: event.articleId } : {}),
      ...(event.collectionId !== undefined ? { collectionId: event.collectionId } : {}),
      ...(event.placement !== undefined ? { placement: event.placement } : {}),
      ...(event.pagePath !== undefined ? { pagePath: event.pagePath } : {}),
      ...(event.referrerPath !== undefined ? { referrerPath: event.referrerPath } : {}),
      occurredAt: event.occurredAt.toISOString(),
    });
  }

  recordBatch(
    _events: Array<{
      productId: string;
      origin: string;
      sessionId?: string;
      blockId?: string;
      articleId?: string;
      collectionId?: string;
      placement?: string;
      pagePath?: string;
      referrerPath?: string;
      occurredAt: Date;
    }>,
  ): Promise<void> {
    return Promise.reject(
      new Error('RedisBufferedClickEventRepository does not support recordBatch'),
    );
  }
}

export class RedisBufferedEngagementEventRepository implements EngagementEventRepository {
  constructor(private readonly bufferStore: TelemetryBufferStore) {}

  async record(event: {
    eventType: string;
    articleId: string;
    pagePath: string;
    placement?: string;
    blockId?: string;
    referrerPath?: string;
    sessionId?: string;
    occurredAt: Date;
  }): Promise<void> {
    await this.bufferStore.pushEngagement({
      eventType: event.eventType,
      articleId: event.articleId,
      pagePath: event.pagePath,
      ...(event.placement !== undefined ? { placement: event.placement } : {}),
      ...(event.blockId !== undefined ? { blockId: event.blockId } : {}),
      ...(event.referrerPath !== undefined ? { referrerPath: event.referrerPath } : {}),
      ...(event.sessionId !== undefined ? { sessionId: event.sessionId } : {}),
      occurredAt: event.occurredAt.toISOString(),
    });
  }

  recordBatch(
    _events: Array<{
      eventType: string;
      articleId: string;
      pagePath: string;
      placement?: string;
      blockId?: string;
      referrerPath?: string;
      sessionId?: string;
      occurredAt: Date;
    }>,
  ): Promise<void> {
    return Promise.reject(
      new Error('RedisBufferedEngagementEventRepository does not support recordBatch'),
    );
  }
}
