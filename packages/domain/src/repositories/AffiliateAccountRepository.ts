import type { AffiliateAccount } from '../entities/Coupon.js';
import type { Marketplace } from '../enums/index.js';

export type UpdateAffiliateAccountData = {
  affiliateTag?: string;
  status?: string;
  validationNotes?: string | null;
  validatedBy?: string | null;
  validatedAt?: Date | null;
};

export interface AffiliateAccountRepository {
  findByMarketplace(marketplace: Marketplace): Promise<AffiliateAccount | null>;
  findAll(): Promise<AffiliateAccount[]>;
  findById(id: string): Promise<AffiliateAccount | null>;
  update(id: string, data: UpdateAffiliateAccountData): Promise<AffiliateAccount>;
}
