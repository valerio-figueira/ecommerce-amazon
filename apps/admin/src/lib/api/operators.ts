import { z } from 'zod';

import {
  operatorsListResponseSchema,
  type CreateOperatorBody,
  type OperatorSummary,
  type UpdateOperatorAccessBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listOperators(): Promise<OperatorSummary[]> {
  const response = await adminFetchParsed('/admin/operators', operatorsListResponseSchema);
  return response.items;
}

export async function createOperator(body: CreateOperatorBody): Promise<OperatorSummary> {
  return adminFetchParsed(
    '/admin/operators',
    z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['admin', 'editor']),
      status: z.enum(['active', 'disabled']),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
    {
      method: 'POST',
      body,
    },
  );
}

export async function updateOperatorAccess(
  id: string,
  body: UpdateOperatorAccessBody,
): Promise<OperatorSummary> {
  return adminFetchParsed(
    `/admin/operators/${id}`,
    z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      name: z.string(),
      role: z.enum(['admin', 'editor']),
      status: z.enum(['active', 'disabled']),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
    {
      method: 'PATCH',
      body,
    },
  );
}

export async function changeOperatorPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  return adminFetchParsed('/admin/profile/password', z.object({ ok: z.literal(true) }), {
    method: 'PATCH',
    body,
  });
}
