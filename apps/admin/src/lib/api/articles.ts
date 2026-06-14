import {
  adminArticleDetailSchema,
  adminArticlesResponseSchema,
  createArticleResponseSchema,
  type AdminArticleDetail,
  type AdminArticleSummary,
  type CreateArticleBody,
  type CreateArticleResponse,
  type UpdateArticleBody,
} from '@ecommerce-amazon/shared/admin';
import { z } from 'zod';

import { adminFetch, adminFetchParsed } from './admin-fetch';

const adminArticlePickerResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      slug: z.string(),
      title: z.string(),
    }),
  ),
});

export async function listAdminArticles(
  status?: string,
): Promise<AdminArticleSummary[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const response = await adminFetchParsed(
    `/admin/articles${query}`,
    adminArticlesResponseSchema,
  );
  return response.items;
}

export async function listAdminArticlePicker(): Promise<
  Array<{ id: string; slug: string; title: string }>
> {
  const response = await adminFetchParsed('/admin/articles?picker=true', adminArticlePickerResponseSchema);
  return response.items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
  }));
}

export async function getAdminArticle(id: string): Promise<AdminArticleDetail | null> {
  try {
    return await adminFetchParsed(`/admin/articles/${id}`, adminArticleDetailSchema);
  } catch {
    return null;
  }
}

export async function createAdminArticle(
  body: CreateArticleBody,
): Promise<CreateArticleResponse> {
  return adminFetchParsed('/admin/articles', createArticleResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateAdminArticle(
  id: string,
  body: UpdateArticleBody,
): Promise<void> {
  await adminFetch(`/admin/articles/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminArticle(id: string): Promise<void> {
  await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
}
