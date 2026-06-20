import {
  Marketplace,
  ValidationError,
  parseMarketplace,
  type CacheStore,
  type CredentialCipher,
  type MarketplaceApiCredentialRepository,
  type MarketplaceCredentialResolverPort,
  type ResolvedMarketplaceCredentials,
} from '@ecommerce-amazon/domain';
import type { AmazonStaticCredentials, ShopeeStaticCredentials } from '@ecommerce-amazon/domain';
import {
  amazonStaticCredentialsBodySchema,
  shopeeStaticCredentialsBodySchema,
} from '@ecommerce-amazon/shared/admin';

import {
  normalizeAmazonStaticCredentials,
  normalizeShopeeStaticCredentials,
  toResolvedAmazonCredentials,
  toResolvedShopeeCredentials,
} from './marketplace-credentials.helpers.js';

const CACHE_KEY_PREFIX = 'vitrine:marketplace-credentials:';
const CACHE_TTL_SECONDS = 300;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStoredCredentials(
  marketplace: Marketplace,
  plaintext: string,
): AmazonStaticCredentials | ShopeeStaticCredentials {
  const json: unknown = JSON.parse(plaintext);
  if (marketplace === Marketplace.AMAZON_BR) {
    return normalizeAmazonStaticCredentials(amazonStaticCredentialsBodySchema.parse(json));
  }
  if (marketplace === Marketplace.SHOPEE_BR) {
    return normalizeShopeeStaticCredentials(shopeeStaticCredentialsBodySchema.parse(json));
  }
  throw new ValidationError(`Unsupported marketplace credentials: ${marketplace}`);
}

function parseCachedCredentials(value: unknown): ResolvedMarketplaceCredentials | null {
  if (!isRecord(value) || typeof value['marketplace'] !== 'string') {
    return null;
  }

  let marketplace: Marketplace;
  try {
    marketplace = parseMarketplace(value['marketplace']);
  } catch {
    return null;
  }

  if (marketplace === Marketplace.AMAZON_BR) {
    const credentials = amazonStaticCredentialsBodySchema.safeParse(value);
    if (!credentials.success) {
      return null;
    }
    return toResolvedAmazonCredentials(credentials.data);
  }

  if (marketplace === Marketplace.SHOPEE_BR) {
    const credentials = shopeeStaticCredentialsBodySchema.safeParse(value);
    if (!credentials.success) {
      return null;
    }
    return toResolvedShopeeCredentials(credentials.data);
  }

  return null;
}

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
      const parsedCache = parseCachedCredentials(cached);
      if (parsedCache) {
        return parsedCache;
      }
    }

    const record = await this.repository.findByMarketplace(marketplace);
    if (!record) {
      return null;
    }

    const plaintext = this.cipher.decrypt(record.credentialsEncrypted);
    const parsed = parseStoredCredentials(marketplace, plaintext);
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
    return parseStoredCredentials(marketplace, plaintext);
  }

  private attachMarketplace(
    marketplace: Marketplace,
    credentials: AmazonStaticCredentials | ShopeeStaticCredentials,
  ): ResolvedMarketplaceCredentials {
    if (marketplace === Marketplace.AMAZON_BR) {
      return toResolvedAmazonCredentials(amazonStaticCredentialsBodySchema.parse(credentials));
    }
    if (marketplace === Marketplace.SHOPEE_BR) {
      return toResolvedShopeeCredentials(shopeeStaticCredentialsBodySchema.parse(credentials));
    }
    throw new ValidationError(`Unsupported marketplace credentials: ${marketplace}`);
  }
}
