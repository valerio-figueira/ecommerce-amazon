import type { SiteSettingsRepository } from '@ecommerce-amazon/domain';
import {
  mergeSiteSettings,
  type SiteSettingsResponse,
  type UpdateSiteSettingsBody,
} from '@ecommerce-amazon/shared/admin';

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
  ) {}

  async execute(input: UpdateSiteSettingsInput): Promise<SiteSettingsResponse> {
    const current = await this.siteSettingsRepository.get();
    const merged = mergeSiteSettings(current.settings, input.patch);
    await this.siteSettingsRepository.save(merged, input.updatedBy);
    await this.gateService.invalidateSettingsCache();

    const getter = new GetSiteSettings(this.siteSettingsRepository);
    return getter.execute();
  }
}
