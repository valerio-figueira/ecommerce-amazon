import {
  operatorProfileSchema,
  updateOperatorProfileResponseSchema,
  type OperatorProfile,
  type UpdateOperatorProfileBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetch, adminFetchParsed } from '@/lib/api/admin-fetch';

export async function getOperatorProfile(): Promise<OperatorProfile> {
  return adminFetchParsed('/admin/profile', operatorProfileSchema);
}

export async function updateOperatorProfile(
  body: UpdateOperatorProfileBody,
): Promise<{ operator: OperatorProfile; token: string }> {
  return adminFetchParsed('/admin/profile', updateOperatorProfileResponseSchema, {
    method: 'PATCH',
    body,
  });
}

export async function removeOperatorAvatar(): Promise<void> {
  await adminFetch('/admin/profile/avatar', { method: 'DELETE' });
}
