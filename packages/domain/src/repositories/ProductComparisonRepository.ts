import type { ProductComparison } from '../entities/Coupon.js';
import type { SyncJobLog } from '../entities/Coupon.js';
import type { ComparisonSource, ComparisonStatus } from '../enums/index.js';

export type AdminComparisonSummaryRecord = {
  id: string;
  shareToken: string;
  slug?: string | undefined;
  status: ComparisonStatus;
  source: ComparisonSource;
  productCount: number;
  productTitles: string[];
  categoryLabel?: string | undefined;
  updatedAt: Date;
};

export interface ProductComparisonRepository {
  findById(id: string): Promise<ProductComparison | null>;
  findByShareToken(token: string): Promise<ProductComparison | null>;
  findBySlug(slug: string): Promise<ProductComparison | null>;
  findByProductIdSet(productIds: string[]): Promise<ProductComparison | null>;
  listAdmin(): Promise<AdminComparisonSummaryRecord[]>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  save(comparison: ProductComparison): Promise<void>;
  update(comparison: ProductComparison): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SyncJobLogRepository {
  save(log: SyncJobLog): Promise<void>;
  findRecent(input: { limit: number; status?: string }): Promise<SyncJobLog[]>;
}

export interface ClickEventRepository {
  record(event: {
    productId: string;
    origin: string;
    marketplace?: string;
    sessionId?: string;
    blockId?: string;
    articleId?: string;
    collectionId?: string;
    placement?: string;
    pagePath?: string;
    referrerPath?: string;
    occurredAt: Date;
  }): Promise<void>;
  recordBatch(
    events: Array<{
      productId: string;
      origin: string;
      marketplace?: string;
      sessionId?: string;
      blockId?: string;
      articleId?: string;
      collectionId?: string;
      placement?: string;
      pagePath?: string;
      referrerPath?: string;
      occurredAt: Date;
    }>,
  ): Promise<void>;
}

export interface EngagementEventRepository {
  record(event: {
    eventType: string;
    articleId: string;
    pagePath: string;
    placement?: string;
    blockId?: string;
    referrerPath?: string;
    sessionId?: string;
    occurredAt: Date;
  }): Promise<void>;
  recordBatch(
    events: Array<{
      eventType: string;
      articleId: string;
      pagePath: string;
      placement?: string;
      blockId?: string;
      referrerPath?: string;
      sessionId?: string;
      occurredAt: Date;
    }>,
  ): Promise<void>;
}
