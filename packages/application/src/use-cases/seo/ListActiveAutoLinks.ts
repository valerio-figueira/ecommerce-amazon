import { type AutoLinkRepository, type CacheStore } from '@ecommerce-amazon/domain';

export class ListActiveAutoLinks {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(): Promise<{
    items: {
      keyword: string;
      targetUrl: string;
      maxMatches: number;
    }[];
  }> {
    const cacheKey = 'vitrine:seo:auto-links';
    const cached = await this.cache.get(cacheKey);
    if (
      cached &&
      typeof cached === 'object' &&
      cached !== null &&
      Array.isArray((cached as { items?: unknown }).items)
    ) {
      return cached as {
        items: { keyword: string; targetUrl: string; maxMatches: number }[];
      };
    }

    const links = await this.autoLinkRepository.listActive();
    const result = {
      items: links.map((link) => ({
        keyword: link.keyword,
        targetUrl: link.targetUrl,
        maxMatches: link.maxMatches,
      })),
    };

    await this.cache.set(cacheKey, result, 3600);
    return result;
  }
}
