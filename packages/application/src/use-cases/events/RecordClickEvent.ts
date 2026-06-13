import type { ClickEventRepository } from '@ecommerce-amazon/domain';

export class RecordClickEvent {
  constructor(private readonly clickRepository: ClickEventRepository) {}

  async execute(input: { productId: string; origin: string; sessionId?: string | undefined }) {
    await this.clickRepository.record({
      productId: input.productId,
      origin: input.origin,
      ...(input.sessionId !== undefined ? { sessionId: input.sessionId } : {}),
      occurredAt: new Date(),
    });
  }
}
