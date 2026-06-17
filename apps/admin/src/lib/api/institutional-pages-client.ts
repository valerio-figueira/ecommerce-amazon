'use client';

import {
  adminInstitutionalPageResponseSchema,
  updateInstitutionalPageBodySchema,
  type AdminInstitutionalPageResponse,
  type UpdateInstitutionalPageBody,
} from '@ecommerce-amazon/shared/about';

import { adminClientFetch } from './admin-client';

function readErrorMessage(payload: unknown): string {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'string') return error;
  }
  return 'Falha ao salvar página institucional';
}

export async function fetchAdminInstitutionalPageClient(
  slug: string,
): Promise<AdminInstitutionalPageResponse> {
  const response = await adminClientFetch(
    `/api/admin/institutional-pages/${encodeURIComponent(slug)}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload));
  }

  const data: unknown = await response.json();
  return adminInstitutionalPageResponseSchema.parse(data);
}

export async function updateAdminInstitutionalPageClient(
  slug: string,
  body: UpdateInstitutionalPageBody,
): Promise<AdminInstitutionalPageResponse> {
  const parsedBody = updateInstitutionalPageBodySchema.parse(body);

  const response = await adminClientFetch(
    `/api/admin/institutional-pages/${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedBody),
    },
  );

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload));
  }

  const data: unknown = await response.json();
  return adminInstitutionalPageResponseSchema.parse(data);
}
