import {
  Marketplace,
  ValidationError,
  type CredentialCipher,
  type MarketplaceApiCredentialRepository,
} from '@ecommerce-amazon/domain';
import type {
  SaveAmazonCredentialsBody,
  SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

import type { MarketplaceCredentialResolver } from '../../services/MarketplaceCredentialResolver.js';
import { GetMarketplaceCredentialsStatus } from './GetMarketplaceCredentialsStatus.js';

export type SaveMarketplaceCredentialsInput = {
  marketplace: Marketplace;
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody;
  updatedBy: string;
};

function buildPublicMetadata(
  marketplace: Marketplace,
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Record<string, unknown> {
  if (marketplace === Marketplace.AMAZON_BR) {
    const amazon = credentials as SaveAmazonCredentialsBody;
    return {
      accessKeyIdPrefix: amazon.accessKeyId.slice(0, 4),
      accessKeyIdLast4: amazon.accessKeyId.slice(-4),
      host: amazon.host ?? 'webservices.amazon.com.br',
      region: amazon.region ?? 'us-east-1',
      configuredAt: new Date().toISOString(),
    };
  }

  const shopee = credentials as SaveShopeeCredentialsBody;
  return {
    partnerId: shopee.partnerId,
    partnerKeyLast4: shopee.partnerKey.slice(-4),
    configuredAt: new Date().toISOString(),
  };
}

export class SaveMarketplaceCredentials {
  constructor(
    private readonly repository: MarketplaceApiCredentialRepository,
    private readonly cipher: CredentialCipher,
    private readonly resolver: MarketplaceCredentialResolver,
  ) {}

  async execute(input: SaveMarketplaceCredentialsInput) {
    if (
      input.marketplace !== Marketplace.AMAZON_BR &&
      input.marketplace !== Marketplace.SHOPEE_BR
    ) {
      throw new ValidationError('Marketplace credentials vault supports Amazon and Shopee only');
    }

    const encrypted = this.cipher.encrypt(JSON.stringify(input.credentials));
    await this.repository.upsert({
      marketplace: input.marketplace,
      authType: 'static_keys',
      credentialsEncrypted: encrypted,
      publicMetadata: buildPublicMetadata(input.marketplace, input.credentials),
      healthStatus: 'not_configured',
      healthMessage: null,
      lastHealthCheckAt: null,
      updatedBy: input.updatedBy,
    });

    await this.resolver.invalidate(input.marketplace);

    const status = new GetMarketplaceCredentialsStatus(this.repository);
    const listed = await status.execute();
    const item = listed.items.find((entry) => entry.marketplace === input.marketplace);
    if (!item) {
      throw new Error('Failed to load saved marketplace credentials status');
    }

    return item;
  }
}
