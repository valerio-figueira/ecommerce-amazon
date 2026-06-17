import {
  marketplaceConnectivityTestResponseSchema,
  marketplaceCredentialStatusSchema,
  marketplaceCredentialsListResponseSchema,
  type MarketplaceConnectivityTestResponse,
  type MarketplaceCredentialStatusDto,
  type SaveAmazonCredentialsBody,
  type SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listMarketplaceCredentials(): Promise<MarketplaceCredentialStatusDto[]> {
  const response = await adminFetchParsed(
    '/admin/marketplace-credentials',
    marketplaceCredentialsListResponseSchema,
  );
  return response.items;
}

export async function saveMarketplaceCredentials(
  marketplace: 'amazon_br' | 'shopee_br',
  body: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Promise<MarketplaceCredentialStatusDto> {
  return adminFetchParsed(
    `/admin/marketplace-credentials/${marketplace}`,
    marketplaceCredentialStatusSchema,
    {
      method: 'PUT',
      body,
    },
  );
}

export async function deleteMarketplaceCredentials(
  marketplace: 'amazon_br' | 'shopee_br',
): Promise<MarketplaceCredentialStatusDto> {
  return adminFetchParsed(
    `/admin/marketplace-credentials/${marketplace}`,
    marketplaceCredentialStatusSchema,
    {
      method: 'DELETE',
    },
  );
}

export async function testMarketplaceConnectivity(
  marketplace: 'amazon_br' | 'shopee_br',
  credentials?: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Promise<MarketplaceConnectivityTestResponse> {
  return adminFetchParsed(
    `/admin/marketplace-credentials/${marketplace}/test`,
    marketplaceConnectivityTestResponseSchema,
    {
      method: 'POST',
      body: credentials ? { credentials } : {},
    },
  );
}
