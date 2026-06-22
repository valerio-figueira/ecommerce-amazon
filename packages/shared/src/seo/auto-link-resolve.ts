import { parseInternalLinkTargetUrl } from '../admin/internal-link-target-schemas.js';
import { isExternalAutoLinkTargetUrl } from './auto-link-target.js';

export type AutoLinkSurface = 'articles' | 'products';

export type AutoLinkRule = {
  id: string;
  keyword: string;
  targetUrl: string;
  maxMatches: number;
  priority?: number | undefined;
  applyTo: AutoLinkSurface | 'both';
};

export type AutoLinkTrackingParams = {
  articleId?: string;
  pagePath?: string;
  referrerPath?: string;
};

export function filterAutoLinksForSurface(
  items: AutoLinkRule[],
  surface: AutoLinkSurface,
): AutoLinkRule[] {
  return items.filter((item) => item.applyTo === 'both' || item.applyTo === surface);
}

export function isAffiliateAutoLinkTarget(targetUrl: string): boolean {
  const parsed = parseInternalLinkTargetUrl(targetUrl);
  if (parsed?.type === 'product') {
    return true;
  }
  return isExternalAutoLinkTargetUrl(targetUrl);
}

function appendAutoLinkQuery(
  basePath: string,
  surface: AutoLinkSurface,
  tracking?: AutoLinkTrackingParams,
): string {
  const searchParams = new URLSearchParams();
  searchParams.set('origin', 'auto_link');
  searchParams.set('placement', surface === 'articles' ? 'auto_link.article' : 'auto_link.product');

  if (tracking?.articleId) {
    searchParams.set('articleId', tracking.articleId);
  }
  if (tracking?.pagePath) {
    searchParams.set('pagePath', tracking.pagePath);
  }
  if (tracking?.referrerPath) {
    searchParams.set('referrerPath', tracking.referrerPath);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `${basePath}?${query}` : basePath;
}

export function buildAutoLinkProductGoUrl(
  slug: string,
  surface: AutoLinkSurface,
  tracking?: AutoLinkTrackingParams,
): string {
  return appendAutoLinkQuery(`/go/${slug}`, surface, tracking);
}

export function buildAutoLinkExternalGoUrl(
  autoLinkId: string,
  surface: AutoLinkSurface,
  tracking?: AutoLinkTrackingParams,
): string {
  return appendAutoLinkQuery(`/go/alink/${autoLinkId}`, surface, tracking);
}

export function resolveAutoLinkHref(
  item: Pick<AutoLinkRule, 'id' | 'targetUrl'>,
  surface: AutoLinkSurface,
  tracking?: AutoLinkTrackingParams,
): string {
  const parsed = parseInternalLinkTargetUrl(item.targetUrl);
  if (parsed?.type === 'product') {
    return buildAutoLinkProductGoUrl(parsed.slug, surface, tracking);
  }
  if (isExternalAutoLinkTargetUrl(item.targetUrl)) {
    return buildAutoLinkExternalGoUrl(item.id, surface, tracking);
  }
  return item.targetUrl;
}
