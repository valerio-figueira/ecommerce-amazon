export type BlockVisibilitySetting = 'all' | 'desktop' | 'mobile';

export type SiteSettingsFeatures = {
  priceAlertsEnabled: boolean;
  batchCheckoutEnabled: boolean;
  publicIndexingEnabled: boolean;
};

export type SiteSettingsSeo = {
  respectAffiliateGate: boolean;
};

export type SiteSettingsCms = {
  publishConfirmRequired: boolean;
  defaultBlockVisibility: BlockVisibilitySetting;
};

export type SiteSettings = {
  features: SiteSettingsFeatures;
  seo: SiteSettingsSeo;
  cms: SiteSettingsCms;
};
