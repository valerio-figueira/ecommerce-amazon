import type { SiteSettingsRepository } from '@ecommerce-amazon/domain';
import type { PublicWebRevalidator } from '@ecommerce-amazon/domain';
import {
  mergeSiteSettings,
  type SiteSettingsResponse,
  type UpdateSiteSettingsBody,
} from '@ecommerce-amazon/shared/admin';

import { buildSiteSettingsRevalidationOptions } from '../../cache/public-cache.helpers.js';
import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import { GetSiteSettings } from './GetSiteSettings.js';

export type UpdateSiteSettingsInput = {
  patch: UpdateSiteSettingsBody;
  updatedBy: string;
};

export class UpdateSiteSettings {
  constructor(
    private readonly siteSettingsRepository: SiteSettingsRepository,
    private readonly gateService: AffiliateScaleGateService,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: UpdateSiteSettingsInput): Promise<SiteSettingsResponse> {
    const current = await this.siteSettingsRepository.get();
    const previousPricesEnabled = current.settings.features.pricesEnabled;
    const merged = mergeSiteSettings(current.settings, input.patch);
    await this.siteSettingsRepository.save(merged, input.updatedBy);
    await this.gateService.invalidateSettingsCache();

    if (merged.features.pricesEnabled !== previousPricesEnabled) {
      await this.webRevalidator.revalidate(buildSiteSettingsRevalidationOptions());
    }

    const getter = new GetSiteSettings(this.siteSettingsRepository);
    return getter.execute();
  }
}
