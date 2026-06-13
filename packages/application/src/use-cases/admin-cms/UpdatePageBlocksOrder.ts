import {
  EntityNotFoundError,
  ValidationError,
  type PageCacheInvalidator,
  type PageRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export class UpdatePageBlocksOrder {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageCacheInvalidator: PageCacheInvalidator,
  ) {}

  async execute(input: {
    pageId: string;
    blocksOrder: Array<{ blockId: string; position: number }>;
  }): Promise<Result<{ updated: number }, ValidationError | EntityNotFoundError>> {
    const page = await this.pageRepository.findPageById(input.pageId);
    if (!page) {
      return err(new EntityNotFoundError('Page', input.pageId));
    }

    if (input.blocksOrder.length === 0) {
      return err(new ValidationError('blocksOrder must not be empty'));
    }

    const positions = input.blocksOrder.map((item) => item.position);
    const uniquePositions = new Set(positions);
    if (uniquePositions.size !== positions.length) {
      return err(new ValidationError('Duplicate positions in blocksOrder'));
    }

    const sortedPositions = [...positions].sort((a, b) => a - b);
    for (let index = 0; index < sortedPositions.length; index++) {
      if (sortedPositions[index] !== index) {
        return err(new ValidationError('Positions must be contiguous starting at 0'));
      }
    }

    const pageBlockIds = new Set(page.blocks.map((block) => block.id));
    for (const item of input.blocksOrder) {
      if (!pageBlockIds.has(item.blockId)) {
        return err(new ValidationError(`Block ${item.blockId} does not belong to this page`));
      }
    }

    if (input.blocksOrder.length !== page.blocks.length) {
      return err(new ValidationError('blocksOrder must include every block on the page'));
    }

    const orders = input.blocksOrder.map((item) => ({
      blockId: item.blockId,
      sortOrder: item.position,
    }));

    try {
      await this.pageRepository.updateBlocksOrder(input.pageId, orders);
    } catch (error) {
      if (error instanceof Error && error.message.includes('do not belong')) {
        return err(new ValidationError(error.message));
      }
      throw error;
    }

    await this.pageCacheInvalidator.invalidateBySlug(page.layout.slug);

    return ok({ updated: orders.length });
  }
}
