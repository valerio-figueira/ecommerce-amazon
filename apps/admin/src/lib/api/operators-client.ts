'use client';

import { adminClientFetch } from '@/lib/api/admin-client';
import {
  operatorsListResponseSchema,
  type CreateOperatorBody,
  type OperatorSummary,
  type UpdateOperatorAccessBody,
} from '@ecommerce-amazon/shared/admin';

export async function listOperatorsClient(): Promise<OperatorSummary[]> {
  const response = await adminClientFetch('/api/admin/operators', { cache: 'no-store' });
  if (!response.ok) throw new Error('Falha ao carregar operadores');
  const payload: unknown = await response.json();
  const parsed = operatorsListResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Falha ao carregar operadores');
  return parsed.data.items;
}

export async function createOperatorClient(body: CreateOperatorBody): Promise<OperatorSummary> {
  const response = await adminClientFetch('/api/admin/operators', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao criar operador');
  }
  return (await response.json()) as OperatorSummary;
}

export async function updateOperatorAccessClient(
  id: string,
  body: UpdateOperatorAccessBody,
): Promise<OperatorSummary> {
  const response = await adminClientFetch(`/api/admin/operators/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao atualizar operador');
  }
  return (await response.json()) as OperatorSummary;
}

export async function changeOperatorPasswordClient(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await adminClientFetch('/api/admin/profile/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao alterar senha');
  }
}
