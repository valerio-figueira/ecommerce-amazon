import type { PublicSiteSettingsResponse } from '@ecommerce-amazon/shared/admin';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';

export class GetPublicSiteSettings {
  constructor(private readonly gateService: AffiliateScaleGateService) {}

  async execute(): Promise<PublicSiteSettingsResponse> {
    const settings = await this.gateService.getSettings();
    const indexingBlocked = await this.gateService.isIndexingBlocked();

    return {
      publicIndexingEnabled: settings.features.publicIndexingEnabled,
      respectAffiliateGate: settings.seo.respectAffiliateGate,
      indexingBlocked,
    };
  }
}
