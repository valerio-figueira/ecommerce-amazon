import { Marketplace } from '@ecommerce-amazon/domain';
import type { MarketplaceApiCredentialRepository } from '@ecommerce-amazon/domain';
import type { MarketplaceCredentialStatusDto } from '@ecommerce-amazon/shared/admin';

const MANAGED_MARKETPLACES: Marketplace[] = [Marketplace.AMAZON_BR, Marketplace.SHOPEE_BR];

export class GetMarketplaceCredentialsStatus {
  constructor(private readonly repository: MarketplaceApiCredentialRepository) {}

  async execute(): Promise<{ items: MarketplaceCredentialStatusDto[] }> {
    const records = await this.repository.findAll();
    const byMarketplace = new Map(records.map((record) => [record.marketplace, record]));

    const items = MANAGED_MARKETPLACES.map((marketplace) => {
      const record = byMarketplace.get(marketplace);
      if (!record) {
        return {
          marketplace,
          authType: 'static_keys' as const,
          configured: false,
          publicMetadata: {},
          healthStatus: 'not_configured' as const,
          healthMessage: null,
          lastHealthCheckAt: null,
          updatedAt: null,
        };
      }

      return {
        marketplace: record.marketplace,
        authType: record.authType,
        configured: true,
        publicMetadata: record.publicMetadata,
        healthStatus: record.healthStatus,
        healthMessage: record.healthMessage ?? null,
        lastHealthCheckAt: record.lastHealthCheckAt?.toISOString() ?? null,
        updatedAt: record.updatedAt.toISOString(),
      };
    });

    return { items };
  }
}
