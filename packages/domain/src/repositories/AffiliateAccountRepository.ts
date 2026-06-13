import type { AffiliateAccount } from '../entities/Coupon.js';
import type { Marketplace } from '../enums/index.js';

export interface AffiliateAccountRepository {
  findByMarketplace(marketplace: Marketplace): Promise<AffiliateAccount | null>;
}
