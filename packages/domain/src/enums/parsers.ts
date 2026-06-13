import { DomainError } from '../errors/DomainError.js';
import {
  AlertStatus,
  ArticleStatus,
  ArticleType,
  CouponStatus,
  DiscountType,
  Marketplace,
  ProductAvailability,
  SnapshotSource,
  SyncJobStatus,
  SyncJobType,
} from './index.js';
import type { Currency } from '../value-objects/index.js';

const MARKETPLACE_VALUES: ReadonlySet<string> = new Set(Object.values(Marketplace));
const AVAILABILITY_VALUES: ReadonlySet<string> = new Set(Object.values(ProductAvailability));
const ALERT_STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(AlertStatus));
const SNAPSHOT_SOURCE_VALUES: ReadonlySet<string> = new Set(Object.values(SnapshotSource));
const COUPON_STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(CouponStatus));
const DISCOUNT_TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(DiscountType));
const ARTICLE_TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(ArticleType));
const ARTICLE_STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(ArticleStatus));
const SYNC_JOB_TYPE_VALUES: ReadonlySet<string> = new Set(Object.values(SyncJobType));
const SYNC_JOB_STATUS_VALUES: ReadonlySet<string> = new Set(Object.values(SyncJobStatus));
const CURRENCY_VALUES: ReadonlySet<string> = new Set(['BRL', 'USD']);
const EMBED_VARIANT_VALUES: ReadonlySet<string> = new Set(['inline', 'highlight', 'comparison']);

export type ContentEmbedVariant = 'inline' | 'highlight' | 'comparison';

function invalidEnum(name: string, value: string): never {
  throw new DomainError(`Invalid ${name}: ${value}`, 'INVALID_ENUM');
}

export function isMarketplace(value: string): value is Marketplace {
  return MARKETPLACE_VALUES.has(value);
}

export function parseMarketplace(value: string): Marketplace {
  return isMarketplace(value) ? value : invalidEnum('marketplace', value);
}

export function isProductAvailability(value: string): value is ProductAvailability {
  return AVAILABILITY_VALUES.has(value);
}

export function parseProductAvailability(value: string): ProductAvailability {
  return isProductAvailability(value) ? value : invalidEnum('availability', value);
}

export function isAlertStatus(value: string): value is AlertStatus {
  return ALERT_STATUS_VALUES.has(value);
}

export function parseAlertStatus(value: string): AlertStatus {
  return isAlertStatus(value) ? value : invalidEnum('alert status', value);
}

export function isSnapshotSource(value: string): value is SnapshotSource {
  return SNAPSHOT_SOURCE_VALUES.has(value);
}

export function parseSnapshotSource(value: string): SnapshotSource {
  return isSnapshotSource(value) ? value : invalidEnum('snapshot source', value);
}

export function isCouponStatus(value: string): value is CouponStatus {
  return COUPON_STATUS_VALUES.has(value);
}

export function parseCouponStatus(value: string): CouponStatus {
  return isCouponStatus(value) ? value : invalidEnum('coupon status', value);
}

export function isDiscountType(value: string): value is DiscountType {
  return DISCOUNT_TYPE_VALUES.has(value);
}

export function parseDiscountType(value: string): DiscountType {
  return isDiscountType(value) ? value : invalidEnum('discount type', value);
}

export function isArticleType(value: string): value is ArticleType {
  return ARTICLE_TYPE_VALUES.has(value);
}

export function parseArticleType(value: string): ArticleType {
  return isArticleType(value) ? value : invalidEnum('article type', value);
}

export function isArticleStatus(value: string): value is ArticleStatus {
  return ARTICLE_STATUS_VALUES.has(value);
}

export function parseArticleStatus(value: string): ArticleStatus {
  return isArticleStatus(value) ? value : invalidEnum('article status', value);
}

export function isCurrency(value: string): value is Currency {
  return CURRENCY_VALUES.has(value);
}

export function parseCurrency(value: string): Currency {
  return isCurrency(value) ? value : invalidEnum('currency', value);
}

export function isContentEmbedVariant(value: string): value is ContentEmbedVariant {
  return EMBED_VARIANT_VALUES.has(value);
}

export function parseContentEmbedVariant(value: string): ContentEmbedVariant {
  return isContentEmbedVariant(value) ? value : invalidEnum('embed variant', value);
}

export function isSyncJobType(value: string): value is SyncJobType {
  return SYNC_JOB_TYPE_VALUES.has(value);
}

export function parseSyncJobType(value: string): SyncJobType {
  return isSyncJobType(value) ? value : invalidEnum('sync job type', value);
}

export function isSyncJobStatus(value: string): value is SyncJobStatus {
  return SYNC_JOB_STATUS_VALUES.has(value);
}

export function parseSyncJobStatus(value: string): SyncJobStatus {
  return isSyncJobStatus(value) ? value : invalidEnum('sync job status', value);
}
