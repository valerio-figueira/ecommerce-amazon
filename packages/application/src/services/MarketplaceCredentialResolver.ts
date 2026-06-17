import {
  Marketplace,
  ValidationError,
  type CacheStore,
  type CredentialCipher,
  type MarketplaceApiCredentialRepository,
  type MarketplaceCredentialResolverPort,
  type ResolvedMarketplaceCredentials,
} from '@ecommerce-amazon/domain';

import type { AmazonStaticCredentials, ShopeeStaticCredentials } from '@ecommerce-amazon/domain';

const CACHE_KEY_PREFIX = 'vitrine:marketplace-credentials:';
const CACHE_TTL_SECONDS = 300;

export class MarketplaceCredentialResolver implements MarketplaceCredentialResolverPort {
  constructor(
    private readonly repository: MarketplaceApiCredentialRepository,
    private readonly cipher: CredentialCipher,
    private readonly cache: CacheStore,
  ) {}

  cacheKey(marketplace: Marketplace): string {
    return `${CACHE_KEY_PREFIX}${marketplace}`;
  }

  async invalidate(marketplace: Marketplace): Promise<void> {
    await this.cache.del(this.cacheKey(marketplace));
  }

  async invalidateAll(marketplaces: Marketplace[]): Promise<void> {
    await Promise.all(marketplaces.map((marketplace) => this.invalidate(marketplace)));
  }

  async resolve(marketplace: Marketplace): Promise<ResolvedMarketplaceCredentials | null> {
    const cacheKey = this.cacheKey(marketplace);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached as ResolvedMarketplaceCredentials;
    }

    const record = await this.repository.findByMarketplace(marketplace);
    if (!record) {
      return null;
    }

    const plaintext = this.cipher.decrypt(record.credentialsEncrypted);
    const parsed = JSON.parse(plaintext) as AmazonStaticCredentials | ShopeeStaticCredentials;
    const resolved = this.attachMarketplace(marketplace, parsed);

    await this.cache.set(cacheKey, resolved, CACHE_TTL_SECONDS);
    await this.repository.touchLastUsed(marketplace);

    return resolved;
  }

  decryptRecord(
    marketplace: Marketplace,
    credentialsEncrypted: string,
  ): AmazonStaticCredentials | ShopeeStaticCredentials {
    const plaintext = this.cipher.decrypt(credentialsEncrypted);
    return JSON.parse(plaintext) as AmazonStaticCredentials | ShopeeStaticCredentials;
  }

  private attachMarketplace(
    marketplace: Marketplace,
    credentials: AmazonStaticCredentials | ShopeeStaticCredentials,
  ): ResolvedMarketplaceCredentials {
    if (marketplace === Marketplace.AMAZON_BR) {
      return { marketplace: Marketplace.AMAZON_BR, ...(credentials as AmazonStaticCredentials) };
    }
    if (marketplace === Marketplace.SHOPEE_BR) {
      return { marketplace: Marketplace.SHOPEE_BR, ...(credentials as ShopeeStaticCredentials) };
    }
    throw new ValidationError(`Unsupported marketplace credentials: ${marketplace}`);
  }
}
