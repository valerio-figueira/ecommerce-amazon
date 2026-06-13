import { eq } from 'drizzle-orm';

import {
  AffiliateAccount,
  parseMarketplace,
  type AffiliateAccountRepository,
  type Marketplace,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

export class DrizzleAffiliateAccountRepository implements AffiliateAccountRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByMarketplace(marketplace: Marketplace): Promise<AffiliateAccount | null> {
    const rows = await this.db
      .select()
      .from(schema.affiliateAccounts)
      .where(eq(schema.affiliateAccounts.marketplace, marketplace))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return new AffiliateAccount(
      row.id,
      parseMarketplace(row.marketplace),
      row.affiliateTag,
      row.status,
      row.validatedBy ?? undefined,
      row.validatedAt ?? undefined,
    );
  }
}
