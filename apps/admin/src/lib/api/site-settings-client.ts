'use client';

import { adminClientFetch } from '@/lib/api/admin-client';
import {
  siteSettingsResponseSchema,
  type SiteSettingsResponse,
  type UpdateSiteSettingsBody,
} from '@ecommerce-amazon/shared/admin';

export async function updateSiteSettingsClient(
  body: UpdateSiteSettingsBody,
): Promise<SiteSettingsResponse> {
  const response = await adminClientFetch('/api/admin/site-settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao salvar configurações');
  }
  const payload: unknown = await response.json();
  const parsed = siteSettingsResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Falha ao salvar configurações');
  return parsed.data;
}
