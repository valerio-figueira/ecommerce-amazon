'use client';

import {
  adminInstitutionalPageResponseSchema,
  updateInstitutionalPageBodySchema,
  type AdminInstitutionalPageResponse,
  type UpdateInstitutionalPageBody,
} from '@ecommerce-amazon/shared/about';
import {
  adminContactInstitutionalPageResponseSchema,
  updateContactInstitutionalPageBodySchema,
  type AdminContactInstitutionalPageResponse,
  type UpdateContactInstitutionalPageBody,
} from '@ecommerce-amazon/shared/contact';
import {
  adminLegalInstitutionalPageResponseSchema,
  updateLegalInstitutionalPageBodySchema,
  type AdminLegalInstitutionalPageResponse,
  type UpdateLegalInstitutionalPageBody,
} from '@ecommerce-amazon/shared/legal';
import {
  isInstitutionalPageSlug,
  type InstitutionalPageSlug,
} from '@ecommerce-amazon/shared/institutional';

import { adminClientFetch } from './admin-client';

function readErrorMessage(payload: unknown): string {
  if (typeof payload === 'object' && payload !== null && 'error' in payload) {
    const error = payload.error;
    if (typeof error === 'string') return error;
  }
  return 'Falha ao salvar página institucional';
}

async function fetchInstitutionalPageJson(slug: InstitutionalPageSlug): Promise<unknown> {
  const response = await adminClientFetch(
    `/api/admin/institutional-pages/${encodeURIComponent(slug)}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload));
  }

  return response.json();
}

async function patchInstitutionalPageJson(
  slug: InstitutionalPageSlug,
  body: unknown,
): Promise<unknown> {
  const response = await adminClientFetch(
    `/api/admin/institutional-pages/${encodeURIComponent(slug)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readErrorMessage(payload));
  }

  return response.json();
}

export async function fetchAdminInstitutionalPageClient(
  slug: 'sobre',
): Promise<AdminInstitutionalPageResponse>;
export async function fetchAdminInstitutionalPageClient(
  slug: 'contato',
): Promise<AdminContactInstitutionalPageResponse>;
export async function fetchAdminInstitutionalPageClient(
  slug: 'legal',
): Promise<AdminLegalInstitutionalPageResponse>;
export async function fetchAdminInstitutionalPageClient(
  slug: InstitutionalPageSlug,
): Promise<
  | AdminInstitutionalPageResponse
  | AdminContactInstitutionalPageResponse
  | AdminLegalInstitutionalPageResponse
> {
  const data = await fetchInstitutionalPageJson(slug);

  switch (slug) {
    case 'sobre':
      return adminInstitutionalPageResponseSchema.parse(data);
    case 'contato':
      return adminContactInstitutionalPageResponseSchema.parse(data);
    case 'legal':
      return adminLegalInstitutionalPageResponseSchema.parse(data);
  }
}

export async function updateAdminInstitutionalPageClient(
  slug: 'sobre',
  body: UpdateInstitutionalPageBody,
): Promise<AdminInstitutionalPageResponse>;
export async function updateAdminInstitutionalPageClient(
  slug: 'contato',
  body: UpdateContactInstitutionalPageBody,
): Promise<AdminContactInstitutionalPageResponse>;
export async function updateAdminInstitutionalPageClient(
  slug: 'legal',
  body: UpdateLegalInstitutionalPageBody,
): Promise<AdminLegalInstitutionalPageResponse>;
export async function updateAdminInstitutionalPageClient(
  slug: InstitutionalPageSlug,
  body:
    | UpdateInstitutionalPageBody
    | UpdateContactInstitutionalPageBody
    | UpdateLegalInstitutionalPageBody,
): Promise<
  | AdminInstitutionalPageResponse
  | AdminContactInstitutionalPageResponse
  | AdminLegalInstitutionalPageResponse
> {
  if (!isInstitutionalPageSlug(slug)) {
    throw new Error('Slug institucional inválido');
  }

  switch (slug) {
    case 'sobre': {
      const parsedBody = updateInstitutionalPageBodySchema.parse(body);
      const data = await patchInstitutionalPageJson(slug, parsedBody);
      return adminInstitutionalPageResponseSchema.parse(data);
    }
    case 'contato': {
      const parsedBody = updateContactInstitutionalPageBodySchema.parse(body);
      const data = await patchInstitutionalPageJson(slug, parsedBody);
      return adminContactInstitutionalPageResponseSchema.parse(data);
    }
    case 'legal': {
      const parsedBody = updateLegalInstitutionalPageBodySchema.parse(body);
      const data = await patchInstitutionalPageJson(slug, parsedBody);
      return adminLegalInstitutionalPageResponseSchema.parse(data);
    }
  }
}
