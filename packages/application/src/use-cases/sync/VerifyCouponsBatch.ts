import {
  Coupon,
  CouponStatus,
  type CouponRepository,
} from '@ecommerce-amazon/domain';

export class VerifyCouponsBatch {
  constructor(private readonly couponRepository: CouponRepository) {}

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

    return { processed: coupons.length };
  }
}
