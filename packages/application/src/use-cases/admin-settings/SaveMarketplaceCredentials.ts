import {
  Marketplace,
  ValidationError,
  parseMarketplace,
  type CredentialCipher,
  type MarketplaceApiCredentialRepository,
} from '@ecommerce-amazon/domain';
import type {
  SaveAmazonCredentialsBody,
  SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

import type { MarketplaceCredentialResolver } from '../../services/MarketplaceCredentialResolver.js';
import { buildPublicMetadata } from '../../services/marketplace-credentials.helpers.js';
import { GetMarketplaceCredentialsStatus } from './GetMarketplaceCredentialsStatus.js';

export type SaveMarketplaceCredentialsInput = {
  marketplace: Marketplace;
  credentials: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody;
  updatedBy: string;
};

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
    const item = listed.items.find(
      (entry) => parseMarketplace(entry.marketplace) === input.marketplace,
    );
    if (!item) {
      throw new Error('Failed to load saved marketplace credentials status');
    }

    return item;
  }
}
