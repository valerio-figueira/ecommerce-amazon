import type { SiteSettings } from '../value-objects/SiteSettings.js';

export type SiteSettingsRecord = {
  settings: SiteSettings;
  updatedAt: Date;
  updatedBy: string | null;
};

export interface SiteSettingsRepository {
  get(): Promise<SiteSettingsRecord>;
  save(settings: SiteSettings, updatedBy: string | null): Promise<SiteSettingsRecord>;
}
