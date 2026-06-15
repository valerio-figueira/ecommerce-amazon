import type { ClickEventRepository } from '@ecommerce-amazon/domain';

export class RecordClickEvent {
  constructor(private readonly clickRepository: ClickEventRepository) {}

  async execute(input: {
    productId: string;
    origin: string;
    sessionId?: string | undefined;
    blockId?: string | undefined;
    articleId?: string | undefined;
    collectionId?: string | undefined;
    placement?: string | undefined;
    pagePath?: string | undefined;
    referrerPath?: string | undefined;
  }) {
    await this.clickRepository.record({
      productId: input.productId,
      origin: input.origin,
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
      ...(input.articleId !== undefined ? { articleId: input.articleId } : {}),
      ...(input.collectionId !== undefined ? { collectionId: input.collectionId } : {}),
      ...(input.placement !== undefined ? { placement: input.placement } : {}),
      ...(input.pagePath !== undefined ? { pagePath: input.pagePath } : {}),
      ...(input.referrerPath !== undefined ? { referrerPath: input.referrerPath } : {}),
      occurredAt: new Date(),
    });
  }
}
