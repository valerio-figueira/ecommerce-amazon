import {
  articlesByCategoryResponseSchema,
  publicArticleCategoriesResponseSchema,
  publishedArticlesListResponseSchema,
  type ListPublishedArticlesQuery,
  type PublicArticleCategoriesResponse,
  type PublishedArticlesListResponse,
} from '@ecommerce-amazon/shared/admin';

import { apiFetchParsed } from './client';

function buildArticlesQuery(params: ListPublishedArticlesQuery): string {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 12));

  if (params.category) {
    searchParams.set('category', params.category);
  }

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  return searchParams.toString();
}

export async function fetchPublishedArticles(
  params: Partial<ListPublishedArticlesQuery> = {},
): Promise<PublishedArticlesListResponse> {
  const query = buildArticlesQuery({
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    ...(params.category !== undefined ? { category: params.category } : {}),
    ...(params.search !== undefined ? { search: params.search } : {}),
  });
  return apiFetchParsed(`/articles?${query}`, publishedArticlesListResponseSchema);
}

export async function fetchPublicArticleCategories(): Promise<PublicArticleCategoriesResponse> {
  return apiFetchParsed('/article-categories', publicArticleCategoriesResponseSchema, {
    next: { revalidate: 300 },
  });
}

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
