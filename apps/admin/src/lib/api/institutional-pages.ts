import {
  adminInstitutionalPageResponseSchema,
  type AdminInstitutionalPageResponse,
  type UpdateInstitutionalPageBody,
} from '@ecommerce-amazon/shared/about';
import {
  adminContactInstitutionalPageResponseSchema,
  type AdminContactInstitutionalPageResponse,
  type UpdateContactInstitutionalPageBody,
} from '@ecommerce-amazon/shared/contact';
import {
  adminLegalInstitutionalPageResponseSchema,
  type AdminLegalInstitutionalPageResponse,
  type UpdateLegalInstitutionalPageBody,
} from '@ecommerce-amazon/shared/legal';
import {
  isInstitutionalPageSlug,
  type InstitutionalPageSlug,
} from '@ecommerce-amazon/shared/institutional';

import { adminFetchParsed } from './admin-fetch';

export async function getAdminInstitutionalPage(
  slug: 'sobre',
): Promise<AdminInstitutionalPageResponse>;
export async function getAdminInstitutionalPage(
  slug: 'contato',
): Promise<AdminContactInstitutionalPageResponse>;
export async function getAdminInstitutionalPage(
  slug: 'legal',
): Promise<AdminLegalInstitutionalPageResponse>;
export async function getAdminInstitutionalPage(
  slug: InstitutionalPageSlug,
): Promise<
  | AdminInstitutionalPageResponse
  | AdminContactInstitutionalPageResponse
  | AdminLegalInstitutionalPageResponse
> {
  switch (slug) {
    case 'sobre':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminInstitutionalPageResponseSchema,
      );
    case 'contato':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminContactInstitutionalPageResponseSchema,
      );
    case 'legal':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminLegalInstitutionalPageResponseSchema,
      );
  }
}

export async function updateAdminInstitutionalPage(
  slug: 'sobre',
  body: UpdateInstitutionalPageBody,
): Promise<AdminInstitutionalPageResponse>;
export async function updateAdminInstitutionalPage(
  slug: 'contato',
  body: UpdateContactInstitutionalPageBody,
): Promise<AdminContactInstitutionalPageResponse>;
export async function updateAdminInstitutionalPage(
  slug: 'legal',
  body: UpdateLegalInstitutionalPageBody,
): Promise<AdminLegalInstitutionalPageResponse>;
export async function updateAdminInstitutionalPage(
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
  switch (slug) {
    case 'sobre':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminInstitutionalPageResponseSchema,
        { method: 'PATCH', body },
      );
    case 'contato':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminContactInstitutionalPageResponseSchema,
        { method: 'PATCH', body },
      );
    case 'legal':
      return adminFetchParsed(
        `/admin/institutional-pages/${encodeURIComponent(slug)}`,
        adminLegalInstitutionalPageResponseSchema,
        { method: 'PATCH', body },
      );
  }
}

export function assertInstitutionalSlug(slug: string): InstitutionalPageSlug {
  if (!isInstitutionalPageSlug(slug)) {
    throw new Error(`Unsupported institutional page slug: ${slug}`);
  }
  return slug;
}
