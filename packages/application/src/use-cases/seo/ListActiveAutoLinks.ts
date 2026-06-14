import { type AutoLinkRepository, type CacheStore } from '@ecommerce-amazon/domain';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

type ActiveAutoLinkItem = {
  keyword: string;
  targetUrl: string;
  maxMatches: number;
  priority: number;
};

type ActiveAutoLinksCache = {
  items: ActiveAutoLinkItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isActiveAutoLinkItem(value: unknown): value is ActiveAutoLinkItem {
  return (
    isRecord(value) &&
    typeof value['keyword'] === 'string' &&
    typeof value['targetUrl'] === 'string' &&
    typeof value['maxMatches'] === 'number' &&
    typeof value['priority'] === 'number'
  );
}

function isActiveAutoLinksCache(value: unknown): value is ActiveAutoLinksCache {
  return (
    isRecord(value) &&
    Array.isArray(value['items']) &&
    value['items'].every(isActiveAutoLinkItem)
  );
}

export class ListActiveAutoLinks {
  constructor(
    private readonly autoLinkRepository: AutoLinkRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(): Promise<ActiveAutoLinksCache> {
    const cached = await this.cache.get(AUTO_LINKS_CACHE_KEY);
    if (isActiveAutoLinksCache(cached)) {
      return cached;
    }

    const links = await this.autoLinkRepository.findAllActiveSortedByPriority();
    const result: ActiveAutoLinksCache = {
      items: links.map((link) => ({
        keyword: link.keyword,
        targetUrl: link.targetUrl,
        maxMatches: link.maxMatches,
        priority: link.priority,
      })),
    };

    await this.cache.set(AUTO_LINKS_CACHE_KEY, result, 3600);
    return result;
  }
}
