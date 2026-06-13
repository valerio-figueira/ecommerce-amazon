import type { Coupon } from '../entities/Coupon.js';
import { Marketplace } from '../enums/index.js';

export interface CouponRepository {
  findActiveVerified(): Promise<Coupon[]>;
  findByMarketplace(marketplace: Marketplace): Promise<Coupon[]>;
  findDueForVerification(limit: number): Promise<Coupon[]>;
  save(coupon: Coupon): Promise<void>;
  saveBatch(coupons: Coupon[]): Promise<void>;
}
