import { z } from 'zod';

import {
  adminComparisonDetailSchema,
  adminComparisonsResponseSchema,
  publishComparisonBodySchema,
  type AdminComparisonDetail,
  type AdminComparisonSummary,
  type CreateAdminComparisonBody,
  type PublishComparisonBody,
  type UpdateAdminComparisonBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listAdminComparisons(): Promise<AdminComparisonSummary[]> {
  const response = await adminFetchParsed('/admin/comparisons', adminComparisonsResponseSchema);
  return response.items;
}

export async function getAdminComparison(id: string): Promise<AdminComparisonDetail> {
  return adminFetchParsed(`/admin/comparisons/${id}`, adminComparisonDetailSchema);
}

export async function createAdminComparison(
  body: CreateAdminComparisonBody,
): Promise<{ id: string }> {
  return adminFetchParsed('/admin/comparisons', z.object({ id: z.string().uuid() }), {
    method: 'POST',
    body,
  });
}

export async function updateAdminComparison(
  id: string,
  body: UpdateAdminComparisonBody,
): Promise<void> {
  await adminFetchParsed(`/admin/comparisons/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function publishAdminComparison(
  id: string,
  body: PublishComparisonBody,
): Promise<void> {
  await adminFetchParsed(`/admin/comparisons/${id}/publish`, z.unknown(), {
    method: 'POST',
    body,
  });
}

export async function deleteAdminComparison(id: string): Promise<void> {
  await adminFetchParsed(`/admin/comparisons/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}

export { publishComparisonBodySchema };
