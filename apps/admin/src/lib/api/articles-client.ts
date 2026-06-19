import { adminClientFetch } from './admin-client';
import {
  adminArticleDetailSchema,
  adminArticlesListResponseSchema,
  createArticleBodySchema,
  createArticleResponseSchema,
  updateArticleBodySchema,
  type AdminArticleDetail,
  type AdminArticlesListResponse,
  type CreateArticleBody,
  type CreateArticleResponse,
  type UpdateArticleBody,
} from '@ecommerce-amazon/shared/admin';

async function readErrorMessage(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return `Request failed (${response.status})`;
}

export type ListAdminArticlesClientParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
};

export async function listAdminArticlesClient(
  params: ListAdminArticlesClientParams = {},
): Promise<AdminArticlesListResponse> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.pageSize !== undefined) search.set('pageSize', String(params.pageSize));
  if (params.search !== undefined && params.search.length > 0) search.set('search', params.search);
  if (params.status !== undefined) search.set('status', params.status);

  const query = search.toString();
  const path = query.length > 0 ? `/api/admin/articles?${query}` : '/api/admin/articles';
  const response = await adminClientFetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const data: unknown = await response.json();
  return adminArticlesListResponseSchema.parse(data);
}

export async function getAdminArticleClient(id: string): Promise<AdminArticleDetail> {
  const response = await adminClientFetch(`/api/admin/articles/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const data: unknown = await response.json();
  return adminArticleDetailSchema.parse(data);
}

export async function createAdminArticleClient(
  body: CreateArticleBody,
): Promise<CreateArticleResponse> {
  const parsedBody = createArticleBodySchema.parse(body);
  const response = await adminClientFetch('/api/admin/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const data: unknown = await response.json();
  return createArticleResponseSchema.parse(data);
}

export async function updateAdminArticleClient(
  id: string,
  body: UpdateArticleBody,
): Promise<void> {
  const parsedBody = updateArticleBodySchema.parse(body);
  const response = await adminClientFetch(`/api/admin/articles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

export async function deleteAdminArticleClient(id: string): Promise<void> {
  const response = await adminClientFetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
