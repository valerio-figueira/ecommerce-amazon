import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';

import { getAttribution } from '@/lib/attribution/context';

export function buildGoUrl(
  slug: string,
  params?: {
    blockId?: string;
    articleId?: string;
    collectionId?: string;
    comparisonSlug?: string;
    sessionId?: string;
    origin?: string;
    placement?: ClickPlacementValue;
    pagePath?: string;
    referrerPath?: string;
    /** When true, falls back to sessionStorage attribution (client-only; never during SSR/hydration). */
    useStoredReferrer?: boolean;
    utmDefaults?: Record<string, string>;
  },
): string {
  const attribution = params?.useStoredReferrer ? getAttribution() : null;
  const searchParams = new URLSearchParams();

  const blockId = params?.blockId ?? attribution?.blockId;
  if (blockId) {
    searchParams.set('blockId', blockId);
  }
  if (params?.articleId) {
    searchParams.set('articleId', params.articleId);
  }
  if (params?.collectionId) {
    searchParams.set('collectionId', params.collectionId);
  }
  if (params?.comparisonSlug) {
    searchParams.set('comparisonSlug', params.comparisonSlug);
  }
  if (params?.sessionId) {
    searchParams.set('sessionId', params.sessionId);
  }
  if (params?.origin) {
    searchParams.set('origin', params.origin);
  }
  if (params?.placement) {
    searchParams.set('placement', params.placement);
  }
  if (params?.pagePath) {
    searchParams.set('pagePath', params.pagePath);
  }

  const referrerPath = params?.referrerPath ?? attribution?.entryPath;
  if (referrerPath) {
    searchParams.set('referrerPath', referrerPath);
  }

  if (params?.utmDefaults) {
    for (const [key, value] of Object.entries(params.utmDefaults)) {
      if (value) {
        searchParams.set(key, value);
      }
    }
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/go/${slug}?${query}` : `/go/${slug}`;
}
