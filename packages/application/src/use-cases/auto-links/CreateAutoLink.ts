import { randomUUID } from 'node:crypto';

import {
  AutoLink,
  parseAutoLinkApplyTo,
  type AutoLinkRepository,
  type CacheStore,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { CreateAutoLinkBody } from '@ecommerce-amazon/shared/admin';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

import { assertUniqueAutoLinkKeyword } from './auto-link.helpers.js';

export class CreateAutoLink {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
    private readonly webRevalidator: PublicWebRevalidator,
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
      applyTo: parseAutoLinkApplyTo(input.applyTo ?? 'both'),
      createdAt: now,
      updatedAt: now,
    });

    await this.autoLinkRepository.save(autoLink);
    await this.cache.del(AUTO_LINKS_CACHE_KEY);
    await this.webRevalidator.revalidate({
      layoutPaths: ['/artigos', '/produtos'],
    });

    return { id: autoLink.id };
  }
}
