import { eq } from 'drizzle-orm';

import {
  AffiliateAccount,
  EntityNotFoundError,
  parseAffiliateAccountStatus,
  parseMarketplace,
  type AffiliateAccountRepository,
  type CreateAffiliateAccountData,
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

  async create(data: CreateAffiliateAccountData): Promise<AffiliateAccount> {
    const rows = await this.db
      .insert(schema.affiliateAccounts)
      .values({
        marketplace: data.marketplace,
        affiliateTag: data.affiliateTag,
        status: data.status,
      })
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to create affiliate account');
    }

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

  async delete(id: string): Promise<void> {
    const rows = await this.db
      .delete(schema.affiliateAccounts)
      .where(eq(schema.affiliateAccounts.id, id))
      .returning({ id: schema.affiliateAccounts.id });

    if (rows.length === 0) {
      throw new EntityNotFoundError('AffiliateAccount', id);
    }
  }

  private mapRow(row: typeof schema.affiliateAccounts.$inferSelect): AffiliateAccount {
    return new AffiliateAccount(
      row.id,
      parseMarketplace(row.marketplace),
      row.affiliateTag,
      parseAffiliateAccountStatus(row.status),
      row.validatedBy ?? undefined,
      row.validatedAt ?? undefined,
      row.validationNotes ?? undefined,
    );
  }
}
