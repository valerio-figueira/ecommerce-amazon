import type { SiteSettingsRepository } from '@ecommerce-amazon/domain';
import type { SiteSettingsResponse } from '@ecommerce-amazon/shared/admin';

export class GetSiteSettings {
  constructor(private readonly siteSettingsRepository: SiteSettingsRepository) {}

  async execute(): Promise<SiteSettingsResponse> {
    const record = await this.siteSettingsRepository.get();
    return {
      ...record.settings,
      updatedAt: record.updatedAt.toISOString(),
      updatedBy: record.updatedBy,
    };
  }
}
