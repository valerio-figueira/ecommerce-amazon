import { randomUUID } from 'node:crypto';

import {
  AutoLink,
  type AutoLinkRepository,
  type CacheStore,
} from '@ecommerce-amazon/domain';
import type { CreateAutoLinkBody } from '@ecommerce-amazon/shared/admin';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

import { assertUniqueAutoLinkKeyword } from './auto-link.helpers.js';

export class CreateAutoLink {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: CreateAutoLinkBody): Promise<{ id: string }> {
    await assertUniqueAutoLinkKeyword(this.autoLinkRepository, input.keyword);

    const now = new Date();
    const autoLink = AutoLink.create({
      id: randomUUID(),
      keyword: input.keyword,
      targetUrl: input.targetUrl,
      maxMatches: input.maxMatches,
      priority: input.priority,
      isActive: input.isActive,
      createdAt: now,
      updatedAt: now,
    });

    await this.autoLinkRepository.save(autoLink);
    await this.cache.del(AUTO_LINKS_CACHE_KEY);

    return { id: autoLink.id };
  }
}
