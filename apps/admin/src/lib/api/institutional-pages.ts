import {
  adminInstitutionalPageResponseSchema,
  type AdminInstitutionalPageResponse,
  type UpdateInstitutionalPageBody,
} from '@ecommerce-amazon/shared/about';

import { adminFetchParsed } from './admin-fetch';

export async function getAdminInstitutionalPage(
  slug: string,
): Promise<AdminInstitutionalPageResponse> {
  return adminFetchParsed(
    `/admin/institutional-pages/${encodeURIComponent(slug)}`,
    adminInstitutionalPageResponseSchema,
  );
}

export async function updateAdminInstitutionalPage(
  slug: string,
  body: UpdateInstitutionalPageBody,
): Promise<AdminInstitutionalPageResponse> {
  return adminFetchParsed(
    `/admin/institutional-pages/${encodeURIComponent(slug)}`,
    adminInstitutionalPageResponseSchema,
    { method: 'PATCH', body },
  );
}
