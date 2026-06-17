import { adminClientFetch } from './admin-client';
import {
  adminAutoLinkListResponseSchema,
  createAutoLinkBodySchema,
  createAutoLinkResponseSchema,
  updateAutoLinkBodySchema,
  type AdminAutoLinkListResponse,
  type CreateAutoLinkBody,
  type ListAutoLinksQuery,
  type UpdateAutoLinkBody,
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

function buildListQuery(params: Partial<ListAutoLinksQuery>): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.search !== undefined && params.search.length > 0) {
    search.set('search', params.search);
  }
  return search.toString();
}

export async function listAutoLinksClient(
  params: Partial<ListAutoLinksQuery> = {},
): Promise<AdminAutoLinkListResponse> {
  const query = buildListQuery(params);
  const path = query.length > 0 ? `/api/admin/auto-links?${query}` : '/api/admin/auto-links';
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const payload: unknown = await response.json();
  return adminAutoLinkListResponseSchema.parse(payload);
}

export async function createAutoLinkClient(body: CreateAutoLinkBody): Promise<{ id: string }> {
  const parsed = createAutoLinkBodySchema.parse(body);
  const response = await adminClientFetch('/api/admin/auto-links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const result: unknown = await response.json();
  return createAutoLinkResponseSchema.parse(result);
}

export async function updateAutoLinkClient(id: string, body: UpdateAutoLinkBody): Promise<void> {
  const parsed = updateAutoLinkBodySchema.parse(body);
  const response = await adminClientFetch(`/api/admin/auto-links/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}

export async function deleteAutoLinkClient(id: string): Promise<void> {
  const response = await adminClientFetch(`/api/admin/auto-links/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
