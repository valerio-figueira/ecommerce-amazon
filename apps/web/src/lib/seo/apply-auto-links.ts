import type { AutoLinksResponse } from '@ecommerce-amazon/shared/admin';
import {
  filterAutoLinksForSurface,
  injectInternalLinks,
  resolveAutoLinkHref,
  type AutoLinkSurface,
  type AutoLinkTrackingParams,
} from '@ecommerce-amazon/shared/seo';

export function applyAutoLinksToHtml(
  html: string,
  autoLinks: AutoLinksResponse['items'],
  surface: AutoLinkSurface,
  tracking?: AutoLinkTrackingParams,
): string {
  const filtered = filterAutoLinksForSurface(autoLinks, surface);

  return injectInternalLinks(
    html,
    filtered.map((item) => ({
      keyword: item.keyword,
      targetUrl: resolveAutoLinkHref(item, surface, tracking),
      maxMatches: item.maxMatches,
      ...(item.priority !== undefined ? { priority: item.priority } : {}),
    })),
  );
}
