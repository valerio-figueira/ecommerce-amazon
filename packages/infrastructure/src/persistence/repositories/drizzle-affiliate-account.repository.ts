import { eq } from 'drizzle-orm';

import {
  AffiliateAccount,
  EntityNotFoundError,
  parseMarketplace,
  type AffiliateAccountRepository,
  type Marketplace,
  type UpdateAffiliateAccountData,
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

    return this.mapRow(row);
  }

  async findAll(): Promise<AffiliateAccount[]> {
    const rows = await this.db.select().from(schema.affiliateAccounts);
    return rows.map((row) => this.mapRow(row));
  }

  async findById(id: string): Promise<AffiliateAccount | null> {
    const rows = await this.db
      .select()
      .from(schema.affiliateAccounts)
      .where(eq(schema.affiliateAccounts.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapRow(row);
  }

  async update(id: string, data: UpdateAffiliateAccountData): Promise<AffiliateAccount> {
    const patch: Partial<typeof schema.affiliateAccounts.$inferInsert> = {};

    if (data.affiliateTag !== undefined) patch.affiliateTag = data.affiliateTag;
    if (data.status !== undefined) patch.status = data.status;
    if (data.validationNotes !== undefined) patch.validationNotes = data.validationNotes;
    if (data.validatedBy !== undefined) patch.validatedBy = data.validatedBy;
    if (data.validatedAt !== undefined) patch.validatedAt = data.validatedAt;

    const rows = await this.db
      .update(schema.affiliateAccounts)
      .set(patch)
      .where(eq(schema.affiliateAccounts.id, id))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('AffiliateAccount', id);
    }

    return this.mapRow(row);
  }

  private mapRow(row: typeof schema.affiliateAccounts.$inferSelect): AffiliateAccount {
    return new AffiliateAccount(
      row.id,
      parseMarketplace(row.marketplace),
      row.affiliateTag,
      row.status,
      row.validatedBy ?? undefined,
      row.validatedAt ?? undefined,
      row.validationNotes ?? undefined,
    );
  }
}
