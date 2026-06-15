export enum Marketplace {
  AMAZON_BR = 'amazon_br',
  SHOPEE_BR = 'shopee_br',
  MERCADOLIVRE_BR = 'mercadolivre_br',
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  UNKNOWN = 'unknown',
}

export enum AlertStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  TRIGGERED = 'triggered',
  EXPIRED = 'expired',
}

export enum ArticleType {
  GUIDE = 'guide',
  REVIEW = 'review',
  COMPARISON = 'comparison',
  LOOKBOOK = 'lookbook_social',
}

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum CouponStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  UNVERIFIED = 'unverified',
}

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
}

export enum SnapshotSource {
  WORKER_CRON = 'worker_cron',
  MANUAL_OVERRIDE = 'manual_override',
}

export enum SyncJobType {
  FULL_SYNC = 'full_sync',
  PRICE_REFRESH = 'price_refresh',
  HYGIENE = 'hygiene',
  LINK_VALIDATION = 'link_validation',
  COUPON_VERIFY = 'coupon_verify',
}

export enum SyncJobStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ClickOrigin {
  LISTING = 'listagem',
  DETAIL = 'detalhe',
  EMBED = 'embed',
  COMPARISON = 'comparador',
  COUPONS = 'cupons',
  COLLECTION = 'coleção',
  SIMILAR = 'similar',
  REDIRECT_GO = 'redirect_go',
}

export enum AffiliateAccountStatus {
  PENDING = 'pending_manual_validation',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum OperatorStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum OperatorRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
}

export { BlockType, PageStatus, BlockVisibility, ProductSortField } from './cms.js';
