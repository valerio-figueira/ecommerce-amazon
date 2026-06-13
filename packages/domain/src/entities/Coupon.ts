import { CouponStatus, DiscountType, Marketplace, SyncJobStatus, SyncJobType } from '../enums/index.js';

export class Coupon {
  constructor(
    readonly id: string,
    readonly marketplace: Marketplace,
    readonly code: string,
    readonly description: string,
    readonly discountValue: number,
    readonly discountType: DiscountType,
    readonly validFrom: Date,
    readonly validUntil: Date,
    readonly status: CouponStatus,
    readonly sourceUrl: string,
    readonly lastVerifiedAt: Date,
  ) {}

  isDisplayable(now: Date = new Date()): boolean {
    const hoursSinceVerify =
      (now.getTime() - this.lastVerifiedAt.getTime()) / (1000 * 60 * 60);
    return (
      this.status === CouponStatus.ACTIVE &&
      hoursSinceVerify < 24 &&
      this.validUntil > now
    );
  }
}

export class ProductComparison {
  constructor(
    readonly id: string,
    readonly shareToken: string,
    readonly sessionId: string,
    readonly productIds: string[],
    readonly editorialIntro: string,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    shareToken: string;
    sessionId: string;
    productIds: string[];
    editorialIntro: string;
    createdAt: Date;
  }): ProductComparison {
    if (props.productIds.length < 2 || props.productIds.length > 3) {
      throw new Error('Comparison requires 2 to 3 products');
    }
    return new ProductComparison(
      props.id,
      props.shareToken,
      props.sessionId,
      props.productIds,
      props.editorialIntro,
      props.createdAt,
    );
  }
}

export class SyncJobLog {
  constructor(
    readonly id: string,
    readonly jobType: SyncJobType,
    readonly status: SyncJobStatus,
    readonly itemsProcessed: number,
    readonly errors: unknown[],
    readonly startedAt: Date,
    readonly finishedAt?: Date,
  ) {}
}

export class AffiliateAccount {
  constructor(
    readonly id: string,
    readonly marketplace: Marketplace,
    readonly affiliateTag: string,
    readonly status: string,
    readonly validatedBy?: string,
    readonly validatedAt?: Date,
  ) {}
}
