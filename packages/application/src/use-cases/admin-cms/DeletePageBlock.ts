import {
  EntityNotFoundError,
  type PageCacheInvalidator,
  type PageRepository,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

export class DeletePageBlock {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageCacheInvalidator: PageCacheInvalidator,
  ) {}

  async execute(input: {
    blockId: string;
  }): Promise<Result<{ deleted: true }, EntityNotFoundError>> {
    const existing = await this.pageRepository.findBlockById(input.blockId);
    if (!existing) {
      return err(new EntityNotFoundError('PageBlock', input.blockId));
    }

    const { pageSlug } = await this.pageRepository.deleteBlock(input.blockId);
    await this.pageCacheInvalidator.invalidateBySlug(pageSlug);

    return ok({ deleted: true });
  }
}
