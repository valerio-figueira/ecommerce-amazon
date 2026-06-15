import {
  EntityNotFoundError,
  type PageCacheInvalidator,
  type PageRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import { err, ok, type Result } from '@ecommerce-amazon/shared';

import { buildCmsPagePublicPath } from '../../cache/public-cache.helpers.js';

export class DeletePageBlock {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageCacheInvalidator: PageCacheInvalidator,
    private readonly webRevalidator: PublicWebRevalidator,
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
    await this.webRevalidator.revalidate({
      paths: [buildCmsPagePublicPath(pageSlug)],
    });

    return ok({ deleted: true });
  }
}
