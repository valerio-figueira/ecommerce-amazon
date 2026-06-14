import { z } from 'zod';

import {
  articleCategoriesResponseSchema,
  createArticleCategoryResponseSchema,
  type ArticleCategorySummary,
  type CreateArticleCategoryBody,
  type UpdateArticleCategoryBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listArticleCategories(): Promise<ArticleCategorySummary[]> {
  const response = await adminFetchParsed(
    '/admin/article-categories',
    articleCategoriesResponseSchema,
  );
  return response.items;
}

export async function createArticleCategory(
  body: CreateArticleCategoryBody,
): Promise<{ id: string }> {
  return adminFetchParsed('/admin/article-categories', createArticleCategoryResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateArticleCategory(
  id: string,
  body: UpdateArticleCategoryBody,
): Promise<void> {
  await adminFetchParsed(`/admin/article-categories/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function deleteArticleCategory(id: string): Promise<void> {
  await adminFetchParsed(`/admin/article-categories/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}
