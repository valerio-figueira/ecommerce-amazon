import {
  EntityNotFoundError,
  type AutoLinkRepository,
  type CacheStore,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { UpdateAutoLinkBody } from '@ecommerce-amazon/shared/admin';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

import { assertUniqueAutoLinkKeyword, keywordsConflict } from './auto-link.helpers.js';

export class UpdateAutoLink {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(id: string, input: UpdateAutoLinkBody): Promise<void> {
    const existing = await this.autoLinkRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundError('AutoLink', id);
    }

    const nextKeyword = input.keyword ?? existing.keyword;
    if (input.keyword !== undefined && keywordsConflict(existing.keyword, nextKeyword)) {
      await assertUniqueAutoLinkKeyword(this.autoLinkRepository, nextKeyword, id);
    }

    const updates: {
      keyword?: string;
      targetUrl?: string;
      maxMatches?: number;
      priority?: number;
      isActive?: boolean;
    } = {};

    if (input.keyword !== undefined) updates.keyword = input.keyword;
    if (input.targetUrl !== undefined) updates.targetUrl = input.targetUrl;
    if (input.maxMatches !== undefined) updates.maxMatches = input.maxMatches;
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    const updated = existing.withUpdates(updates);

    await this.autoLinkRepository.save(updated);
    await this.cache.del(AUTO_LINKS_CACHE_KEY);
    await this.webRevalidator.revalidate({
      layoutPaths: ['/artigos'],
    });
  }
}
