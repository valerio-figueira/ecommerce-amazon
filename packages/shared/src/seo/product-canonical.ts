export function normalizeSiteBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export function buildProductPagePath(slug: string): string {
  return `/produtos/${slug}`;
}

export function buildProductCanonicalUrl(siteBaseUrl: string, slug: string): string {
  return `${normalizeSiteBaseUrl(siteBaseUrl)}${buildProductPagePath(slug)}`;
}

/**
 * Editorial override fallback: DB `canonical_url` when set, otherwise slug-based default.
 */
export function resolveProductCanonicalUrl(
  slug: string,
  siteBaseUrl: string,
  editorialOverride?: string | null,
): string {
  const trimmed = editorialOverride?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildProductCanonicalUrl(siteBaseUrl, slug);
}
