import { eq } from 'drizzle-orm';

import {
  EntityNotFoundError,
  parseMarketplace,
  type Marketplace,
  type MarketplaceApiCredentialRecord,
  type MarketplaceApiCredentialRepository,
  type UpdateMarketplaceApiCredentialHealthData,
  type UpsertMarketplaceApiCredentialData,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

import {
  parseMarketplaceCredentialAuthType,
  parseMarketplaceCredentialHealthStatus,
} from './marketplace-credential-parsers.js';

export class DrizzleMarketplaceApiCredentialRepository implements MarketplaceApiCredentialRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByMarketplace(
    marketplace: Marketplace,
  ): Promise<MarketplaceApiCredentialRecord | null> {
    const rows = await this.db
      .select()
      .from(schema.marketplaceApiCredentials)
      .where(eq(schema.marketplaceApiCredentials.marketplace, marketplace))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.mapRow(row);
  }

  async findAll(): Promise<MarketplaceApiCredentialRecord[]> {
    const rows = await this.db.select().from(schema.marketplaceApiCredentials);
    return rows.map((row) => this.mapRow(row));
  }

  async upsert(data: UpsertMarketplaceApiCredentialData): Promise<MarketplaceApiCredentialRecord> {
    const rows = await this.db
      .insert(schema.marketplaceApiCredentials)
      .values({
        marketplace: data.marketplace,
        authType: data.authType,
        credentialsEncrypted: data.credentialsEncrypted,
        publicMetadata: data.publicMetadata,
        healthStatus: data.healthStatus ?? 'not_configured',
        healthMessage: data.healthMessage ?? null,
        lastHealthCheckAt: data.lastHealthCheckAt ?? null,
        updatedBy: data.updatedBy ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.marketplaceApiCredentials.marketplace,
        set: {
          authType: data.authType,
          credentialsEncrypted: data.credentialsEncrypted,
          publicMetadata: data.publicMetadata,
          ...(data.healthStatus !== undefined ? { healthStatus: data.healthStatus } : {}),
          ...(data.healthMessage !== undefined ? { healthMessage: data.healthMessage } : {}),
          ...(data.lastHealthCheckAt !== undefined
            ? { lastHealthCheckAt: data.lastHealthCheckAt }
            : {}),
          updatedBy: data.updatedBy ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to upsert marketplace API credentials');
    }

    return this.mapRow(row);
  }

  async updateHealth(
    marketplace: Marketplace,
    data: UpdateMarketplaceApiCredentialHealthData,
  ): Promise<MarketplaceApiCredentialRecord> {
    const rows = await this.db
      .update(schema.marketplaceApiCredentials)
      .set({
        healthStatus: data.healthStatus,
        healthMessage: data.healthMessage ?? null,
        lastHealthCheckAt: data.lastHealthCheckAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.marketplaceApiCredentials.marketplace, marketplace))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('MarketplaceApiCredential', marketplace);
    }

    return this.mapRow(row);
  }

  async touchLastUsed(marketplace: Marketplace): Promise<void> {
    await this.db
      .update(schema.marketplaceApiCredentials)
      .set({ lastUsedAt: new Date() })
      .where(eq(schema.marketplaceApiCredentials.marketplace, marketplace));
  }

  async delete(marketplace: Marketplace): Promise<void> {
    const rows = await this.db
      .delete(schema.marketplaceApiCredentials)
      .where(eq(schema.marketplaceApiCredentials.marketplace, marketplace))
      .returning({ id: schema.marketplaceApiCredentials.id });

    if (rows.length === 0) {
      throw new EntityNotFoundError('MarketplaceApiCredential', marketplace);
    }
  }

  private mapRow(
    row: typeof schema.marketplaceApiCredentials.$inferSelect,
  ): MarketplaceApiCredentialRecord {
    return {
      id: row.id,
      marketplace: parseMarketplace(row.marketplace),
      authType: parseMarketplaceCredentialAuthType(row.authType),
      credentialsEncrypted: row.credentialsEncrypted,
      publicMetadata: row.publicMetadata ?? {},
      healthStatus: parseMarketplaceCredentialHealthStatus(row.healthStatus),
      ...(row.healthMessage ? { healthMessage: row.healthMessage } : {}),
      ...(row.lastHealthCheckAt ? { lastHealthCheckAt: row.lastHealthCheckAt } : {}),
      ...(row.lastUsedAt ? { lastUsedAt: row.lastUsedAt } : {}),
      updatedAt: row.updatedAt,
      ...(row.updatedBy ? { updatedBy: row.updatedBy } : {}),
    };
  }
}
