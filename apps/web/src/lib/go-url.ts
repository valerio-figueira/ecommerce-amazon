export function buildGoUrl(
  slug: string,
  params?: {
    blockId?: string;
    articleId?: string;
    sessionId?: string;
    origin?: string;
    utmDefaults?: Record<string, string>;
  },
): string {
  const searchParams = new URLSearchParams();
  if (params?.blockId) {
    searchParams.set('blockId', params.blockId);
  }
  if (params?.articleId) {
    searchParams.set('articleId', params.articleId);
  }
  if (params?.sessionId) {
    searchParams.set('sessionId', params.sessionId);
  }
  if (params?.origin) {
    searchParams.set('origin', params.origin);
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
