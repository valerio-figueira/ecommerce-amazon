import { eq } from 'drizzle-orm';

import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  type SiteSettings,
} from '@ecommerce-amazon/shared/admin';

import type { SiteSettingsRecord, SiteSettingsRepository } from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

export const SITE_SETTINGS_ROW_ID = '00000000-0000-4000-8000-000000000001';

export class DrizzleSiteSettingsRepository implements SiteSettingsRepository {
  constructor(private readonly db: DrizzleClient) {}

  async get(): Promise<SiteSettingsRecord> {
    const rows = await this.db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.id, SITE_SETTINGS_ROW_ID))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return {
        settings: DEFAULT_SITE_SETTINGS,
        updatedAt: new Date(),
        updatedBy: null,
      };
    }

    return {
      settings: parseSiteSettings(row.settings),
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    };
  }

  async save(settings: SiteSettings, updatedBy: string | null): Promise<SiteSettingsRecord> {
    const parsed = parseSiteSettings(settings);
    const now = new Date();

    const rows = await this.db
      .insert(schema.siteSettings)
      .values({
        id: SITE_SETTINGS_ROW_ID,
        settings: parsed,
        updatedAt: now,
        updatedBy,
      })
      .onConflictDoUpdate({
        target: schema.siteSettings.id,
        set: {
          settings: parsed,
          updatedAt: now,
          updatedBy,
        },
      })
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to persist site settings');
    }

    return {
      settings: parseSiteSettings(row.settings),
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    };
  }
}
