'use client';

import { adminClientFetch } from '@/lib/api/admin-client';
import { readClientErrorMessage } from '@/lib/api/read-client-error';
import {
  operatorSummarySchema,
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
    throw new Error(await readClientErrorMessage(response, 'Falha ao criar operador'));
  }
  const payload: unknown = await response.json();
  return operatorSummarySchema.parse(payload);
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
    throw new Error(await readClientErrorMessage(response, 'Falha ao atualizar operador'));
  }
  const payload: unknown = await response.json();
  return operatorSummarySchema.parse(payload);
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
    throw new Error(await readClientErrorMessage(response, 'Falha ao alterar senha'));
  }
}
