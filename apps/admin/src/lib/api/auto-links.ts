import { z } from 'zod';

import {
  adminAutoLinkListResponseSchema,
  createAutoLinkResponseSchema,
  type AdminAutoLinkListResponse,
  type CreateAutoLinkBody,
  type ListAutoLinksQuery,
  type UpdateAutoLinkBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

function buildListQuery(params: Partial<ListAutoLinksQuery>): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.search !== undefined && params.search.length > 0) {
    search.set('search', params.search);
  }
  return search.toString();
}

export async function listAutoLinks(
  params: Partial<ListAutoLinksQuery> = {},
): Promise<AdminAutoLinkListResponse> {
  const query = buildListQuery(params);
  const path = query.length > 0 ? `/admin/auto-links?${query}` : '/admin/auto-links';
  return adminFetchParsed(path, adminAutoLinkListResponseSchema);
}

export async function createAutoLink(body: CreateAutoLinkBody): Promise<{ id: string }> {
  return adminFetchParsed('/admin/auto-links', createAutoLinkResponseSchema, {
    method: 'POST',
    body,
  });
}

export async function updateAutoLink(id: string, body: UpdateAutoLinkBody): Promise<void> {
  await adminFetchParsed(`/admin/auto-links/${id}`, z.unknown(), {
    method: 'PATCH',
    body,
  });
}

export async function deleteAutoLink(id: string): Promise<void> {
  await adminFetchParsed(`/admin/auto-links/${id}`, z.unknown(), {
    method: 'DELETE',
  });
}
