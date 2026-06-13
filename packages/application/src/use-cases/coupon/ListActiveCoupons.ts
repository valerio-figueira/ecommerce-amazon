import type { CacheStore, Coupon, CouponRepository } from '@ecommerce-amazon/domain';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCachedCoupon(value: unknown): value is Coupon {
  return isRecord(value) && typeof value['id'] === 'string' && typeof value['code'] === 'string';
}

function isCachedCouponList(value: unknown): value is Coupon[] {
  return Array.isArray(value) && value.every(isCachedCoupon);
}

export class ListActiveCoupons {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(): Promise<Coupon[]> {
    const cacheKey = 'vitrine:coupons:active';
    const cached = await this.cache.get(cacheKey);
    if (isCachedCouponList(cached)) {
      return cached;
    }

    const coupons = await this.couponRepository.findActiveVerified();
    const displayable = coupons.filter((c) => c.isDisplayable());
    await this.cache.set(cacheKey, displayable, 1800);
    return displayable;
  }
}
