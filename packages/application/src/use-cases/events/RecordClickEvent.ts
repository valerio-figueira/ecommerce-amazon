import type { ClickEventRepository } from '@ecommerce-amazon/domain';

export class RecordClickEvent {
  constructor(private readonly clickRepository: ClickEventRepository) {}

  async execute(input: {
    productId: string;
    origin: string;
    sessionId?: string | undefined;
    blockId?: string | undefined;
  }) {
    await this.clickRepository.record({
      productId: input.productId,
      origin: input.origin,
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      ...(input.blockId !== undefined ? { blockId: input.blockId } : {}),
      occurredAt: new Date(),
    });
  }
}
