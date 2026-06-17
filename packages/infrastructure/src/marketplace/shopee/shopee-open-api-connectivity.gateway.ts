import {
  Marketplace,
  type MarketplaceConnectivityGateway,
  type MarketplaceConnectivityResult,
  type ShopeeStaticCredentials,
} from '@ecommerce-amazon/domain';

import { shopeeTestConnectivity } from './shopee-open-api.client.js';

export class ShopeeOpenApiConnectivityGateway implements MarketplaceConnectivityGateway {
  readonly marketplace = Marketplace.SHOPEE_BR;

  async test(credentials: ShopeeStaticCredentials): Promise<MarketplaceConnectivityResult> {
    const result = await shopeeTestConnectivity(credentials);
    return {
      ok: result.ok,
      httpStatus: result.httpStatus,
      message: result.message,
      ...(result.rateLimitHint ? { rateLimitHint: result.rateLimitHint } : {}),
    };
  }
}
