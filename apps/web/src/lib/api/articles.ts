import { articlesByCategoryResponseSchema } from '@ecommerce-amazon/shared/admin';

import { apiFetchParsed } from './client';

export async function fetchArticlesByCategory(slug: string) {
  try {
    return await apiFetchParsed(
      `/articles?category=${encodeURIComponent(slug)}`,
      articlesByCategoryResponseSchema,
    );
  } catch {
    return null;
  }
}
