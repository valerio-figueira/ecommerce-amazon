import { z } from 'zod';

import {
  adminCollectionSchema,
  adminCollectionsResponseSchema,
  type AdminCollection,
  type AdminCollectionSummary,
  type CreateCollectionBody,
  type UpdateCollectionBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listAdminCollections(): Promise<AdminCollectionSummary[]> {
  const response = await adminFetchParsed('/admin/collections', adminCollectionsResponseSchema);
  return response.items;
}

export async function getAdminCollection(id: string): Promise<AdminCollection> {
  return adminFetchParsed(`/admin/collections/${id}`, adminCollectionSchema);
}

export async function createAdminCollection(body: CreateCollectionBody): Promise<{ id: string }> {
  return adminFetchParsed('/admin/collections', z.object({ id: z.string().uuid() }), {
    method: 'POST',
    body,
  });
}

export async function updateAdminCollection(id: string, body: UpdateCollectionBody): Promise<void> {
  await adminFetchParsed(`/admin/collections/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function deleteAdminCollection(id: string): Promise<void> {
  await adminFetchParsed(`/admin/collections/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}
