import { z } from 'zod';

import {
  adminCategoriesResponseSchema,
  type AdminCategoryTreeNode,
  type CreateCategoryBody,
  type ReorderCategoriesBody,
  type UpdateCategoryBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export type { CategoryFlatOption } from './categories-utils';
export { flattenAdminCategoriesForPicker } from './categories-utils';

export async function listAdminCategories(): Promise<AdminCategoryTreeNode[]> {
  const response = await adminFetchParsed('/admin/categories', adminCategoriesResponseSchema);
  return response.items;
}

export async function createAdminCategory(body: CreateCategoryBody): Promise<{ id: string }> {
  return adminFetchParsed('/admin/categories', z.object({ id: z.string().uuid() }), {
    method: 'POST',
    body,
  });
}

export async function updateAdminCategory(id: string, body: UpdateCategoryBody): Promise<void> {
  await adminFetchParsed(`/admin/categories/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await adminFetchParsed(`/admin/categories/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}

export async function reorderAdminCategories(body: ReorderCategoriesBody): Promise<void> {
  await adminFetchParsed('/admin/categories/reorder', z.unknown(), {
    method: 'PATCH',
    body,
  });
}
