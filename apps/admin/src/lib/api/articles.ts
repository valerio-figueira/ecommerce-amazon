import {
  adminArticleDetailSchema,
  adminArticlesListResponseSchema,
  createArticleResponseSchema,
  type AdminArticleDetail,
  type AdminArticlesListResponse,
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

export type ListAdminArticlesParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export async function listAdminArticles(
  params: ListAdminArticlesParams = {},
): Promise<AdminArticlesListResponse> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.search !== undefined && params.search.length > 0) search.set('search', params.search);
  if (params.status !== undefined) search.set('status', params.status);

  const query = search.toString();
  const path = query.length > 0 ? `/admin/articles?${query}` : '/admin/articles';
  return adminFetchParsed(path, adminArticlesListResponseSchema);
}

export async function listAdminArticlePicker(): Promise<
  Array<{ id: string; slug: string; title: string }>
> {
  const response = await adminFetchParsed(
    '/admin/articles?picker=true',
    adminArticlePickerResponseSchema,
  );
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

export async function createAdminArticle(body: CreateArticleBody): Promise<CreateArticleResponse> {
  return adminFetchParsed('/admin/articles', createArticleResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateAdminArticle(id: string, body: UpdateArticleBody): Promise<void> {
  await adminFetch(`/admin/articles/${id}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminArticle(id: string): Promise<void> {
  await adminFetch(`/admin/articles/${id}`, { method: 'DELETE' });
}
