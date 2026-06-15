import type { EngagementEventRepository } from '@ecommerce-amazon/domain';

export class RecordEngagementEvent {
  constructor(private readonly engagementRepository: EngagementEventRepository) {}

  async execute(input: {
    eventType: string;
    articleId: string;
    pagePath: string;
    placement?: string | undefined;
    blockId?: string | undefined;
    referrerPath?: string | undefined;
    sessionId?: string | undefined;
  }) {
    await this.engagementRepository.record({
      eventType: input.eventType,
      articleId: input.articleId,
      pagePath: input.pagePath,
      ...(input.placement !== undefined ? { placement: input.placement } : {}),
      ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
      ...(input.referrerPath !== undefined ? { referrerPath: input.referrerPath } : {}),
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      occurredAt: new Date(),
    });
  }
}
