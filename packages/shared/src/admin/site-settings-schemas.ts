import type { SiteSettings } from '@ecommerce-amazon/domain';
import { z } from 'zod';

export const blockVisibilitySettingSchema = z.enum(['all', 'desktop', 'mobile']);

export const siteSettingsFeaturesSchema = z.object({
  priceAlertsEnabled: z.boolean(),
  batchCheckoutEnabled: z.boolean(),
  publicIndexingEnabled: z.boolean(),
  pricesEnabled: z.boolean(),
});

export const siteSettingsSeoSchema = z.object({
  respectAffiliateGate: z.boolean(),
});

export const siteSettingsCmsSchema = z.object({
  publishConfirmRequired: z.boolean(),
  defaultBlockVisibility: blockVisibilitySettingSchema,
});

export const siteSettingsSchema = z.object({
  features: siteSettingsFeaturesSchema,
  seo: siteSettingsSeoSchema,
  cms: siteSettingsCmsSchema,
}) satisfies z.ZodType<SiteSettings>;

export type { SiteSettings };

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  features: {
    priceAlertsEnabled: true,
    batchCheckoutEnabled: true,
    publicIndexingEnabled: true,
    pricesEnabled: true,
  },
  seo: {
    respectAffiliateGate: true,
  },
  cms: {
    publishConfirmRequired: true,
    defaultBlockVisibility: 'all',
  },
};

export const updateSiteSettingsBodySchema = siteSettingsSchema.partial().deepPartial();

export type UpdateSiteSettingsBody = z.infer<typeof updateSiteSettingsBodySchema>;

export const siteSettingsResponseSchema = siteSettingsSchema.extend({
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid().nullable(),
});

export type SiteSettingsResponse = z.infer<typeof siteSettingsResponseSchema>;

export const publicSiteSettingsResponseSchema = z.object({
  publicIndexingEnabled: z.boolean(),
  respectAffiliateGate: z.boolean(),
  indexingBlocked: z.boolean(),
  pricesEnabled: z.boolean(),
});

export type PublicSiteSettingsResponse = z.infer<typeof publicSiteSettingsResponseSchema>;

export function parseSiteSettings(value: unknown): SiteSettings {
  const record = typeof value === 'object' && value !== null ? value : {};
  const features =
    typeof record === 'object' &&
    record !== null &&
    'features' in record &&
    typeof record.features === 'object' &&
    record.features !== null
      ? record.features
      : {};
  const seo =
    typeof record === 'object' &&
    record !== null &&
    'seo' in record &&
    typeof record.seo === 'object' &&
    record.seo !== null
      ? record.seo
      : {};
  const cms =
    typeof record === 'object' &&
    record !== null &&
    'cms' in record &&
    typeof record.cms === 'object' &&
    record.cms !== null
      ? record.cms
      : {};

  return siteSettingsSchema.parse({
    features: { ...DEFAULT_SITE_SETTINGS.features, ...features },
    seo: { ...DEFAULT_SITE_SETTINGS.seo, ...seo },
    cms: { ...DEFAULT_SITE_SETTINGS.cms, ...cms },
  });
}

export function mergeSiteSettings(
  current: SiteSettings,
  patch: UpdateSiteSettingsBody,
): SiteSettings {
  return siteSettingsSchema.parse({
    features: { ...current.features, ...patch.features },
    seo: { ...current.seo, ...patch.seo },
    cms: { ...current.cms, ...patch.cms },
  });
}
