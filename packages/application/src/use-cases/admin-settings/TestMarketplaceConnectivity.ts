import {
  Marketplace,
  UnsupportedMarketplaceError,
  ValidationError,
  type AffiliateAccountRepository,
  type MarketplaceApiCredentialRepository,
  type MarketplaceConnectivityGateway,
  type MarketplaceStaticCredentials,
} from '@ecommerce-amazon/domain';
import type {
  SaveAmazonCredentialsBody,
  SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

import type { MarketplaceCredentialResolver } from '../../services/MarketplaceCredentialResolver.js';
import {
  toAmazonStaticCredentials,
  toShopeeStaticCredentials,
} from '../../services/marketplace-credentials.helpers.js';

export type TestMarketplaceConnectivityInput = {
  marketplace: Marketplace;
  credentials?: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody;
};

export class TestMarketplaceConnectivity {
  constructor(
    private readonly repository: MarketplaceApiCredentialRepository,
    private readonly resolver: MarketplaceCredentialResolver,
    private readonly connectivityGateways: MarketplaceConnectivityGateway[],
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
  ) {}

  async execute(input: TestMarketplaceConnectivityInput) {
    const gateway = this.connectivityGateways.find(
      (entry) => entry.marketplace === input.marketplace,
    );
    if (!gateway) {
      throw new UnsupportedMarketplaceError(input.marketplace);
    }

    const credentials = await this.resolveCredentials(input);
    const affiliateAccount = await this.affiliateAccountRepository.findByMarketplace(
      input.marketplace,
    );

    const result = await gateway.test(credentials, {
      ...(affiliateAccount?.affiliateTag ? { affiliateTag: affiliateAccount.affiliateTag } : {}),
    });

    const record = await this.repository.findByMarketplace(input.marketplace);
    if (record) {
      await this.repository.updateHealth(input.marketplace, {
        healthStatus: result.ok ? 'connected' : 'error',
        healthMessage: result.message,
        lastHealthCheckAt: new Date(),
      });
    }

    return result;
  }

  private async resolveCredentials(
    input: TestMarketplaceConnectivityInput,
  ): Promise<MarketplaceStaticCredentials> {
    if (input.credentials) {
      if (input.marketplace === Marketplace.AMAZON_BR) {
        const amazon = toAmazonStaticCredentials(input.credentials);
        return {
          accessKeyId: amazon.accessKeyId,
          secretAccessKey: amazon.secretAccessKey,
          ...(amazon.host ? { host: amazon.host } : {}),
          ...(amazon.region ? { region: amazon.region } : {}),
        };
      }

      const shopee = toShopeeStaticCredentials(input.credentials);
      return {
        partnerId: shopee.partnerId,
        partnerKey: shopee.partnerKey,
      };
    }

    const record = await this.repository.findByMarketplace(input.marketplace);
    if (!record) {
      throw new ValidationError('Credenciais não configuradas para este marketplace');
    }

    const decrypted = this.resolver.decryptRecord(input.marketplace, record.credentialsEncrypted);

    if (input.marketplace === Marketplace.AMAZON_BR) {
      const amazon = toAmazonStaticCredentials(decrypted);
      return {
        accessKeyId: amazon.accessKeyId,
        secretAccessKey: amazon.secretAccessKey,
        ...(amazon.host ? { host: amazon.host } : {}),
        ...(amazon.region ? { region: amazon.region } : {}),
      };
    }

    const shopee = toShopeeStaticCredentials(decrypted);
    return {
      partnerId: shopee.partnerId,
      partnerKey: shopee.partnerKey,
    };
  }
}
