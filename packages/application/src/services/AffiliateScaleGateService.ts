import {
  AffiliateAccountStatus,
  type AffiliateAccountRepository,
  type CacheStore,
  type SiteSettingsRepository,
} from '@ecommerce-amazon/domain';
import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  type SiteSettings,
} from '@ecommerce-amazon/shared/admin';

const SITE_SETTINGS_CACHE_KEY = 'vitrine:site-settings';
const SITE_SETTINGS_CACHE_TTL_SECONDS = 300;

export class AffiliateScaleGateService {
  constructor(
    private readonly siteSettingsRepository: SiteSettingsRepository,
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly cache: CacheStore,
  ) {}

  async getSettings(): Promise<SiteSettings> {
    const cached = await this.cache.get(SITE_SETTINGS_CACHE_KEY);
    if (cached) {
      return parseSiteSettings(cached);
    }

    const record = await this.siteSettingsRepository.get();
    await this.cache.set(SITE_SETTINGS_CACHE_KEY, record.settings, SITE_SETTINGS_CACHE_TTL_SECONDS);
    return record.settings;
  }

  async invalidateSettingsCache(): Promise<void> {
    await this.cache.del(SITE_SETTINGS_CACHE_KEY);
  }

  async hasPendingAffiliateAccount(): Promise<boolean> {
    const accounts = await this.affiliateAccountRepository.findAll();
    return accounts.some((account) => account.status === AffiliateAccountStatus.PENDING);
  }

  async isIndexingBlocked(): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.features.publicIndexingEnabled) {
      return true;
    }

    if (settings.seo.respectAffiliateGate && (await this.hasPendingAffiliateAccount())) {
      return true;
    }

    return false;
  }

  async isPriceAlertsEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.features.priceAlertsEnabled;
  }

  async isBatchCheckoutEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.features.batchCheckoutEnabled;
  }

  static fallbackSettings(): SiteSettings {
    return DEFAULT_SITE_SETTINGS;
  }
}
