import type {
  ClickEventRepository,
  EngagementEventRepository,
  TelemetryBufferStore,
} from '@ecommerce-amazon/domain';

export type FlushTelemetryBufferResult = {
  clicksFlushed: number;
  engagementFlushed: number;
};

export class FlushTelemetryBuffer {
  constructor(
    private readonly bufferStore: TelemetryBufferStore,
    private readonly clickRepository: ClickEventRepository,
    private readonly engagementRepository: EngagementEventRepository,
    private readonly batchSize: number,
  ) {}

  async execute(): Promise<FlushTelemetryBufferResult> {
    let clicksFlushed = 0;
    let engagementFlushed = 0;

    clicksFlushed += await this.flushClicks();
    engagementFlushed += await this.flushEngagement();

    return { clicksFlushed, engagementFlushed };
  }

  private async flushClicks(): Promise<number> {
    let flushed = 0;

    while (true) {
      const batch = await this.bufferStore.drainClicks(this.batchSize);
      if (batch.length === 0) break;

      try {
        await this.clickRepository.recordBatch(
          batch.map((event) => ({
            productId: event.productId,
            origin: event.origin,
            ...(event.sessionId !== undefined ? { sessionId: event.sessionId } : {}),
            ...(event.blockId !== undefined ? { blockId: event.blockId } : {}),
            ...(event.articleId !== undefined ? { articleId: event.articleId } : {}),
            ...(event.collectionId !== undefined ? { collectionId: event.collectionId } : {}),
            ...(event.placement !== undefined ? { placement: event.placement } : {}),
            ...(event.pagePath !== undefined ? { pagePath: event.pagePath } : {}),
            ...(event.referrerPath !== undefined ? { referrerPath: event.referrerPath } : {}),
            occurredAt: new Date(event.occurredAt),
          })),
        );
        await this.bufferStore.confirmDrainClicks(batch);
        flushed += batch.length;
      } catch {
        await this.bufferStore.requeueClicks(batch);
        throw new Error('Failed to flush click telemetry batch to PostgreSQL');
      }

      if (batch.length < this.batchSize) break;
    }

    return flushed;
  }

  private async flushEngagement(): Promise<number> {
    let flushed = 0;

    while (true) {
      const batch = await this.bufferStore.drainEngagement(this.batchSize);
      if (batch.length === 0) break;

      try {
        await this.engagementRepository.recordBatch(
          batch.map((event) => ({
            eventType: event.eventType,
            articleId: event.articleId,
            pagePath: event.pagePath,
            ...(event.placement !== undefined ? { placement: event.placement } : {}),
            ...(event.blockId !== undefined ? { blockId: event.blockId } : {}),
            ...(event.referrerPath !== undefined ? { referrerPath: event.referrerPath } : {}),
            ...(event.sessionId !== undefined ? { sessionId: event.sessionId } : {}),
            occurredAt: new Date(event.occurredAt),
          })),
        );
        await this.bufferStore.confirmDrainEngagement(batch);
        flushed += batch.length;
      } catch {
        await this.bufferStore.requeueEngagement(batch);
        throw new Error('Failed to flush engagement telemetry batch to PostgreSQL');
      }

      if (batch.length < this.batchSize) break;
    }

    return flushed;
  }
}
