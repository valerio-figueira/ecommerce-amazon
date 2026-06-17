import { adminClientFetch } from './admin-client';
import {
  articleCategoriesResponseSchema,
  createArticleCategoryBodySchema,
  createArticleCategoryResponseSchema,
  updateArticleCategoryBodySchema,
  type ArticleCategorySummary,
  type CreateArticleCategoryBody,
  type UpdateArticleCategoryBody,
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

export async function listArticleCategoriesClient(): Promise<ArticleCategorySummary[]> {
  const response = await adminClientFetch('/api/admin/article-categories', { cache: 'no-store' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const payload: unknown = await response.json();
  return articleCategoriesResponseSchema.parse(payload).items;
}

export async function createArticleCategoryClient(
  body: CreateArticleCategoryBody,
): Promise<{ id: string }> {
  const parsed = createArticleCategoryBodySchema.parse(body);
  const response = await adminClientFetch('/api/admin/article-categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const result: unknown = await response.json();
  return createArticleCategoryResponseSchema.parse(result);
}

export async function updateArticleCategoryClient(
  id: string,
  body: UpdateArticleCategoryBody,
): Promise<void> {
  const parsed = updateArticleCategoryBodySchema.parse(body);
  const response = await adminClientFetch(`/api/admin/article-categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

export async function deleteArticleCategoryClient(id: string): Promise<void> {
  const response = await adminClientFetch(`/api/admin/article-categories/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
