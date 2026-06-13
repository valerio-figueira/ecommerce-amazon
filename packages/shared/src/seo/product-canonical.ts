export function normalizeSiteBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export function buildProductPagePath(slug: string): string {
  return `/produtos/${slug}`;
}

export function buildProductCanonicalUrl(siteBaseUrl: string, slug: string): string {
  return `${normalizeSiteBaseUrl(siteBaseUrl)}${buildProductPagePath(slug)}`;
}

export function resolveProductCanonicalUrl(
  slug: string,
  siteBaseUrl: string,
  override?: string | undefined,
): string {
  const trimmed = override?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    return trimmed;
  }
  return buildProductCanonicalUrl(siteBaseUrl, slug);
}
