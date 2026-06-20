import {
  Marketplace,
  EntityNotFoundError,
  ValidationError,
  parseMarketplace,
  type MarketplaceApiCredentialRepository,
} from '@ecommerce-amazon/domain';

import type { MarketplaceCredentialResolver } from '../../services/MarketplaceCredentialResolver.js';
import { GetMarketplaceCredentialsStatus } from './GetMarketplaceCredentialsStatus.js';

export type DeleteMarketplaceCredentialsInput = {
  marketplace: Marketplace;
};

export class DeleteMarketplaceCredentials {
  constructor(
    private readonly repository: MarketplaceApiCredentialRepository,
    private readonly resolver: MarketplaceCredentialResolver,
  ) {}

  async execute(input: DeleteMarketplaceCredentialsInput) {
    if (
      input.marketplace !== Marketplace.AMAZON_BR &&
      input.marketplace !== Marketplace.SHOPEE_BR
    ) {
      throw new ValidationError('Marketplace credentials vault supports Amazon and Shopee only');
    }

    try {
      await this.repository.delete(input.marketplace);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw error;
      }
      throw error;
    }

    await this.resolver.invalidate(input.marketplace);

    const status = new GetMarketplaceCredentialsStatus(this.repository);
    const listed = await status.execute();
    const item = listed.items.find(
      (entry) => parseMarketplace(entry.marketplace) === input.marketplace,
    );
    if (!item) {
      throw new Error('Failed to load marketplace credentials status after delete');
    }

    return item;
  }
}
