import {
  Coupon,
  CouponStatus,
  type CacheStore,
  type CouponRepository,
} from '@ecommerce-amazon/domain';
import { COUPONS_ACTIVE_CACHE_KEY } from '@ecommerce-amazon/shared/cache';

export class VerifyCouponsBatch {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(limit = 50) {
    const coupons = await this.couponRepository.findDueForVerification(limit);
    const now = new Date();

    for (const coupon of coupons) {
      const expired = coupon.validUntil < now;
      await this.couponRepository.save(
        new Coupon(
          coupon.id,
          coupon.marketplace,
          coupon.code,
          coupon.description,
          coupon.discountValue,
          coupon.discountType,
          coupon.validFrom,
          coupon.validUntil,
          expired ? CouponStatus.EXPIRED : CouponStatus.ACTIVE,
          coupon.sourceUrl,
          now,
        ),
      );
    }

    if (coupons.length > 0) {
      await this.cache.del(COUPONS_ACTIVE_CACHE_KEY);
    }

    return { processed: coupons.length };
  }
}
