import type { SiteSettings } from '@ecommerce-amazon/shared/admin';

export type SiteSettingsRecord = {
  settings: SiteSettings;
  updatedAt: Date;
  updatedBy: string | null;
};

export interface SiteSettingsRepository {
  get(): Promise<SiteSettingsRecord>;
  save(settings: SiteSettings, updatedBy: string | null): Promise<SiteSettingsRecord>;
}
