export const COUPONS_ACTIVE_CACHE_KEY = 'vitrine:coupons:active';

export function articlePublicCacheKey(slug: string): string {
  return `vitrine:article:slug:v2:${slug}`;
}
