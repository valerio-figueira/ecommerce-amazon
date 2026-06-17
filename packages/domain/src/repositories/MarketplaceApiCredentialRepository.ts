import type { Marketplace } from '../enums/index.js';

export type MarketplaceCredentialAuthType = 'static_keys' | 'oauth';

export type MarketplaceCredentialHealthStatus = 'not_configured' | 'connected' | 'error';

export type MarketplaceApiCredentialRecord = {
  id: string;
  marketplace: Marketplace;
  authType: MarketplaceCredentialAuthType;
  credentialsEncrypted: string;
  publicMetadata: Record<string, unknown>;
  healthStatus: MarketplaceCredentialHealthStatus;
  healthMessage?: string;
  lastHealthCheckAt?: Date;
  lastUsedAt?: Date;
  updatedAt: Date;
  updatedBy?: string;
};

export type UpsertMarketplaceApiCredentialData = {
  marketplace: Marketplace;
  authType: MarketplaceCredentialAuthType;
  credentialsEncrypted: string;
  publicMetadata: Record<string, unknown>;
  healthStatus?: MarketplaceCredentialHealthStatus;
  healthMessage?: string | null;
  lastHealthCheckAt?: Date | null;
  updatedBy?: string;
};

export type UpdateMarketplaceApiCredentialHealthData = {
  healthStatus: MarketplaceCredentialHealthStatus;
  healthMessage?: string | null;
  lastHealthCheckAt?: Date | null;
};

export interface MarketplaceApiCredentialRepository {
  findByMarketplace(marketplace: Marketplace): Promise<MarketplaceApiCredentialRecord | null>;
  findAll(): Promise<MarketplaceApiCredentialRecord[]>;
  upsert(data: UpsertMarketplaceApiCredentialData): Promise<MarketplaceApiCredentialRecord>;
  updateHealth(
    marketplace: Marketplace,
    data: UpdateMarketplaceApiCredentialHealthData,
  ): Promise<MarketplaceApiCredentialRecord>;
  touchLastUsed(marketplace: Marketplace): Promise<void>;
  delete(marketplace: Marketplace): Promise<void>;
}
