import { adminClientFetch } from './admin-client';
import {
  contentClusterAdminDetailSchema,
  contentClustersAdminResponseSchema,
  createContentClusterBodySchema,
  createContentClusterResponseSchema,
  updateContentClusterBodySchema,
  type ContentClusterAdminSummary,
  type CreateContentClusterBody,
  type UpdateContentClusterBody,
} from '@ecommerce-amazon/shared/admin';

export async function listContentClustersClient(): Promise<ContentClusterAdminSummary[]> {
  const response = await adminClientFetch('/api/admin/content-clusters', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Falha ao carregar clusters');
  }
  const payload: unknown = await response.json();
  const parsed = contentClustersAdminResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Falha ao carregar clusters');
  }
  return parsed.data.items;
}

export async function getContentClusterClient(id: string) {
  const response = await adminClientFetch(`/api/admin/content-clusters/${id}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Falha ao carregar cluster');
  }
  const payload: unknown = await response.json();
  const parsed = contentClusterAdminDetailSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Falha ao carregar cluster');
  }
  return parsed.data;
}

export async function createContentClusterClient(
  body: CreateContentClusterBody,
): Promise<{ id: string }> {
  const parsedBody = createContentClusterBodySchema.parse(body);
  const response = await adminClientFetch('/api/admin/content-clusters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(payload, 'Falha ao criar cluster'));
  }
  const payload: unknown = await response.json();
  const parsed = createContentClusterResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Falha ao criar cluster');
  }
  return parsed.data;
}

export async function updateContentClusterClient(
  id: string,
  body: UpdateContentClusterBody,
): Promise<void> {
  const parsedBody = updateContentClusterBodySchema.parse(body);
  const response = await adminClientFetch(`/api/admin/content-clusters/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsedBody),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(payload, 'Falha ao atualizar cluster'));
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return payload.error;
  }
  return fallback;
}
