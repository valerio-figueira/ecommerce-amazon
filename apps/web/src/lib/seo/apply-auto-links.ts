import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';
import { injectInternalLinks } from '@ecommerce-amazon/shared/seo';

export function applyAutoLinksToHtml(html: string, autoLinks: AutoLinksResponse['items']): string {
  return injectInternalLinks(
    html,
    autoLinks.map((item) => ({
      keyword: item.keyword,
      targetUrl: item.targetUrl,
      maxMatches: item.maxMatches,
      ...(item.priority !== undefined ? { priority: item.priority } : {}),
    })),
  );
}
