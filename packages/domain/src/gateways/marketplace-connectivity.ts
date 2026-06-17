import type { Marketplace } from '../enums/index.js';

export type MarketplaceConnectivityResult = {
  ok: boolean;
  httpStatus?: number;
  message: string;
  rateLimitHint?: string;
};

export type AmazonStaticCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  host?: string;
  region?: string;
};

export type ShopeeStaticCredentials = {
  partnerId: string;
  partnerKey: string;
};

export type MarketplaceStaticCredentials = AmazonStaticCredentials | ShopeeStaticCredentials;

export interface MarketplaceConnectivityGateway {
  readonly marketplace: Marketplace;
  test(
    credentials: MarketplaceStaticCredentials,
    context?: { affiliateTag?: string },
  ): Promise<MarketplaceConnectivityResult>;
}
