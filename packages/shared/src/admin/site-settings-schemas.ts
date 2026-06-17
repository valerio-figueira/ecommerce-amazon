import type { SiteSettings } from '@ecommerce-amazon/domain';
import { z } from 'zod';

export const blockVisibilitySettingSchema = z.enum(['all', 'desktop', 'mobile']);

export const siteSettingsFeaturesSchema = z.object({
  priceAlertsEnabled: z.boolean(),
  batchCheckoutEnabled: z.boolean(),
  publicIndexingEnabled: z.boolean(),
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
});

export type PublicSiteSettingsResponse = z.infer<typeof publicSiteSettingsResponseSchema>;

export function parseSiteSettings(value: unknown): SiteSettings {
  return siteSettingsSchema.parse(value);
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
