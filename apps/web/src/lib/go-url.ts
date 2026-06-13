export function buildGoUrl(
  slug: string,
  params?: { blockId?: string; sessionId?: string },
): string {
  const searchParams = new URLSearchParams();
  if (params?.blockId) {
    searchParams.set('blockId', params.blockId);
  }
  if (params?.sessionId) {
    searchParams.set('sessionId', params.sessionId);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/go/${slug}?${query}` : `/go/${slug}`;
}
