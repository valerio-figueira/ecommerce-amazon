import {
  ComparisonSource,
  ComparisonStatus,
  CouponStatus,
  DiscountType,
  Marketplace,
  SyncJobStatus,
  SyncJobType,
} from '../enums/index.js';

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
    readonly status: ComparisonStatus,
    readonly source: ComparisonSource,
    readonly updatedAt: Date,
    readonly slug?: string | undefined,
    readonly seoTitle?: string | undefined,
    readonly seoDescription?: string | undefined,
    readonly showCategoryCarousel: boolean = true,
    readonly publishedAt?: Date | undefined,
  ) {}

  static create(props: {
    id: string;
    shareToken: string;
    sessionId: string;
    productIds: string[];
    editorialIntro: string;
    createdAt: Date;
    status?: ComparisonStatus;
    source?: ComparisonSource;
    updatedAt?: Date;
    slug?: string | undefined;
    seoTitle?: string | undefined;
    seoDescription?: string | undefined;
    showCategoryCarousel?: boolean;
    publishedAt?: Date | undefined;
  }): ProductComparison {
    if (props.productIds.length < 2 || props.productIds.length > 3) {
      throw new Error('Comparison requires 2 to 3 products');
    }
    const now = props.updatedAt ?? props.createdAt;
    return new ProductComparison(
      props.id,
      props.shareToken,
      props.sessionId,
      props.productIds,
      props.editorialIntro,
      props.createdAt,
      props.status ?? ComparisonStatus.DRAFT,
      props.source ?? ComparisonSource.USER_GENERATED,
      now,
      props.slug,
      props.seoTitle,
      props.seoDescription,
      props.showCategoryCarousel ?? true,
      props.publishedAt,
    );
  }

  isPublished(): boolean {
    return this.status === ComparisonStatus.PUBLISHED;
  }

  canonicalPath(): string {
    if (this.isPublished() && this.slug) {
      return `/comparar/${this.slug}`;
    }
    return `/comparar/${this.shareToken}`;
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
    readonly validationNotes?: string,
  ) {}
}
