import {
  siteSettingsResponseSchema,
  type SiteSettingsResponse,
  type UpdateSiteSettingsBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  return adminFetchParsed('/admin/site-settings', siteSettingsResponseSchema);
}

export async function updateSiteSettings(
  body: UpdateSiteSettingsBody,
): Promise<SiteSettingsResponse> {
  return adminFetchParsed('/admin/site-settings', siteSettingsResponseSchema, {
    method: 'PATCH',
    body,
  });
}
