import type { ProductComparison } from '../entities/Coupon.js';
import type { SyncJobLog } from '../entities/Coupon.js';

export interface ProductComparisonRepository {
  findByShareToken(token: string): Promise<ProductComparison | null>;
  save(comparison: ProductComparison): Promise<void>;
}

export interface SyncJobLogRepository {
  save(log: SyncJobLog): Promise<void>;
}

export interface ClickEventRepository {
  record(event: {
    productId: string;
    origin: string;
    sessionId?: string;
    blockId?: string;
    articleId?: string;
    occurredAt: Date;
  }): Promise<void>;
}
