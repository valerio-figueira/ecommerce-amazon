import { z } from 'zod';

import {
  contentClusterAdminDetailSchema,
  contentClustersAdminResponseSchema,
  createContentClusterResponseSchema,
  type CreateContentClusterBody,
  type UpdateContentClusterBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listContentClusters() {
  return adminFetchParsed('/admin/content-clusters', contentClustersAdminResponseSchema);
}

export async function getContentCluster(id: string) {
  return adminFetchParsed(`/admin/content-clusters/${id}`, contentClusterAdminDetailSchema);
}

export async function createContentCluster(
  body: CreateContentClusterBody,
): Promise<{ id: string }> {
  return adminFetchParsed('/admin/content-clusters', createContentClusterResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateContentCluster(
  id: string,
  body: UpdateContentClusterBody,
): Promise<void> {
  await adminFetchParsed(`/admin/content-clusters/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function deleteContentCluster(id: string): Promise<void> {
  await adminFetchParsed(`/admin/content-clusters/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}
