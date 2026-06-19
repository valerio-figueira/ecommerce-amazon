import { cache } from 'react';

import {
  articlePublicDetailSchema,
  resolveArticleUpdatedAtIso,
  type ArticlePublicDetail,
} from '@ecommerce-amazon/shared/admin';
import { pageLayoutDeliverySchema, type PageLayoutDeliveryDto } from '@ecommerce-amazon/shared/cms';
import type { AboutPageContent } from '@ecommerce-amazon/shared/about';
import { comparisonPublicDetailSchema } from '@ecommerce-amazon/shared/comparison';

import { fetchCuratedCollection } from '@/lib/api/collections';
import { fetchInstitutionalAboutPage } from '@/lib/api/institutional';
import { fetchOrNotFound, fetchPageLayoutOrNull } from '@/lib/api/safe-fetch';
import {
  categoryDetailSchema,
  productDetailSchema,
  type CategoryDetailDto,
  type CuratedCollectionDetailDto,
  type ProductDetailDto,
} from '@/lib/api/schemas';

export const getHomeLayout = cache(async (): Promise<PageLayoutDeliveryDto | null> => {
  const data = await fetchPageLayoutOrNull('home');
  if (!data) {
    return null;
  }
  return pageLayoutDeliverySchema.parse(data);
});

export const getProduct = cache(async (slug: string): Promise<ProductDetailDto | null> => {
  return fetchOrNotFound(`/products/${slug}`, productDetailSchema);
});

export const getCategory = cache(async (slug: string): Promise<CategoryDetailDto | null> => {
  return fetchOrNotFound(`/categories/${slug}`, categoryDetailSchema);
});

export const getCollection = cache(
  async (slug: string, page = 1): Promise<CuratedCollectionDetailDto | null> => {
    return fetchCuratedCollection(slug, { page });
  },
);

export const getComparison = cache(async (identifier: string) => {
  return fetchOrNotFound(`/comparisons/${identifier}`, comparisonPublicDetailSchema);
});

export const getArticle = cache(async (slug: string): Promise<ArticlePublicDetail | null> => {
  const article = await fetchOrNotFound(`/articles/${slug}`, articlePublicDetailSchema);
  if (!article) {
    return null;
  }

  return {
    ...article,
    cluster: article.cluster ?? null,
    updatedAt: resolveArticleUpdatedAtIso(article),
  };
});

export const getInstitutionalAboutPage = cache(async (): Promise<AboutPageContent> => {
  return fetchInstitutionalAboutPage();
});
