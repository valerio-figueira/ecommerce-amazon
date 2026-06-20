import {
  publishedArticlesListResponseSchema,
  type PublishedArticlesListResponse,
} from '@ecommerce-amazon/shared/admin';

import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema, type ProductsPageDto } from '@/lib/api/schemas';

export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_PREVIEW_LIMIT = 5;
export const SEARCH_RESULTS_PAGE_SIZE = 12;

export type SearchResultType = 'products' | 'articles';

export function searchTypeToParam(type: SearchResultType): 'produtos' | 'artigos' {
  return type === 'products' ? 'produtos' : 'artigos';
}

export function parseSearchResultType(value: string | undefined): SearchResultType {
  if (value === 'artigos' || value === 'articles') {
    return 'articles';
  }
  return 'products';
}

type SearchProductsOptions = {
  page?: number;
  pageSize?: number;
};

type SearchArticlesOptions = {
  page?: number;
  limit?: number;
};

export async function searchArticlesPreview(query: string): Promise<PublishedArticlesListResponse> {
  return searchArticlesResults(query, {
    page: 1,
    limit: SEARCH_PREVIEW_LIMIT,
  });
}

export async function searchProductsPreview(query: string): Promise<ProductsPageDto> {
  return searchProductsResults(query, {
    page: 1,
    pageSize: SEARCH_PREVIEW_LIMIT,
  });
}

export async function searchArticlesResults(
  query: string,
  options: SearchArticlesOptions = {},
): Promise<PublishedArticlesListResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? SEARCH_RESULTS_PAGE_SIZE;
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('search', query.trim());

  return apiFetchParsed(`/articles?${params.toString()}`, publishedArticlesListResponseSchema);
}

export async function searchProductsResults(
  query: string,
  options: SearchProductsOptions = {},
): Promise<ProductsPageDto> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? SEARCH_RESULTS_PAGE_SIZE;
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('search', query.trim());
  params.set('visibleOnly', 'true');

  return apiFetchParsed(`/products?${params.toString()}`, productsPageSchema);
}

export function totalSearchPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
