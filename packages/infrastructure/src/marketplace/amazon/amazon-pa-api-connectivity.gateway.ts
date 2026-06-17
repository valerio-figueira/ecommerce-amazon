import {
  Marketplace,
  type AmazonStaticCredentials,
  type MarketplaceConnectivityGateway,
  type MarketplaceConnectivityResult,
} from '@ecommerce-amazon/domain';

import {
  amazonPaApiTestConnectivity,
} from '../amazon/amazon-pa-api.client.js';

export class AmazonPaApiConnectivityGateway implements MarketplaceConnectivityGateway {
  readonly marketplace = Marketplace.AMAZON_BR;

  async test(
    credentials: AmazonStaticCredentials,
    context?: { affiliateTag?: string },
  ): Promise<MarketplaceConnectivityResult> {
    const result = await amazonPaApiTestConnectivity(credentials, context?.affiliateTag);
    return {
      ok: result.ok,
      httpStatus: result.httpStatus,
      message: result.message,
      ...(result.rateLimitHint ? { rateLimitHint: result.rateLimitHint } : {}),
    };
  }
}
