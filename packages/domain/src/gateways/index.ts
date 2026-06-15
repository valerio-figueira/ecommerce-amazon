import type { Marketplace, ProductAvailability } from '../enums/index.js';
import type { Price } from '../value-objects/index.js';

export type MarketplaceFetchResult = {
  externalId: string;
  rawTitle: string;
  price: Price;
  availability: ProductAvailability;
  rating?: number;
  reviewCount?: number;
  imageUrls: string[];
};

export interface MarketplaceFetcher {
  readonly marketplace: Marketplace;
  fetchProduct(externalId: string): Promise<MarketplaceFetchResult>;
  fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]>;
}

export interface MarketplaceFetcherFactory {
  get(marketplace: Marketplace): MarketplaceFetcher;
}

export interface AffiliateTrackingParams {
  blockId?: string;
  sessionId?: string;
  origin?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface AffiliateLinkBuilder {
  build(marketplace: Marketplace, externalId: string): string;
  buildBatchCheckout(marketplace: Marketplace, externalIds: string[]): string;
  buildWithTracking(
    marketplace: Marketplace,
    externalId: string,
    tracking: AffiliateTrackingParams,
    affiliateTag?: string,
  ): string;
}

export interface EmailSender {
  send(params: { to: string; subject: string; html: string }): Promise<void>;
}

export interface CacheStore {
  get(key: string): Promise<unknown | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  increment(key: string): Promise<number>;
  getVersion(entityType: string, id: string): Promise<number>;
  incrementVersion(entityType: string, id: string): Promise<number>;
}

export type { EventBus } from './event-bus.js';

export interface CacheInvalidator {
  invalidateProducts(productIds: string[]): Promise<void>;
}

export interface PageCacheInvalidator {
  invalidateBySlug(slug: string): Promise<void>;
}

export type PublicWebRevalidationOptions = {
  paths?: string[];
  layoutPaths?: string[];
};

export interface PublicWebRevalidator {
  revalidate(options: PublicWebRevalidationOptions): Promise<void>;
}

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

export interface AuthTokenService {
  sign(payload: AuthTokenPayload): Promise<string>;
  verify(token: string): Promise<AuthTokenPayload>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}

export type { ObjectStorage, StoredObject } from './object-storage.js';
export { ADMIN_AVATAR_KEY_PREFIX, ADMIN_MEDIA_KEY_PREFIX } from './object-storage.js';
