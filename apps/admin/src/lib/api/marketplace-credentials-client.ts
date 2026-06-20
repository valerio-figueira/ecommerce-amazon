'use client';

import { z } from 'zod';

import { adminClientFetch } from '@/lib/api/admin-client';
import {
  marketplaceConnectivityTestResponseSchema,
  marketplaceCredentialStatusSchema,
  marketplaceCredentialsListResponseSchema,
  type MarketplaceConnectivityTestResponse,
  type MarketplaceCredentialStatusDto,
  type SaveAmazonCredentialsBody,
  type SaveShopeeCredentialsBody,
} from '@ecommerce-amazon/shared/admin';

const apiErrorSchema = z.object({ error: z.string().optional() });

function readApiError(payload: unknown, fallback: string): string {
  const parsed = apiErrorSchema.safeParse(payload);
  return parsed.success ? (parsed.data.error ?? fallback) : fallback;
}

export async function listMarketplaceCredentialsClient(): Promise<
  MarketplaceCredentialStatusDto[]
> {
  const response = await adminClientFetch('/api/admin/marketplace-credentials', {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Falha ao carregar integrações de marketplace');
  const payload: unknown = await response.json();
  const parsed = marketplaceCredentialsListResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Falha ao carregar integrações de marketplace');
  return parsed.data.items;
}

export async function saveMarketplaceCredentialsClient(
  marketplace: 'amazon_br' | 'shopee_br',
  body: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Promise<MarketplaceCredentialStatusDto> {
  const response = await adminClientFetch(`/api/admin/marketplace-credentials/${marketplace}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readApiError(payload, 'Falha ao salvar credenciais'));
  }
  const result: unknown = await response.json();
  return marketplaceCredentialStatusSchema.parse(result);
}

export async function deleteMarketplaceCredentialsClient(
  marketplace: 'amazon_br' | 'shopee_br',
): Promise<MarketplaceCredentialStatusDto> {
  const response = await adminClientFetch(`/api/admin/marketplace-credentials/${marketplace}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readApiError(payload, 'Falha ao remover credenciais'));
  }
  const result: unknown = await response.json();
  return marketplaceCredentialStatusSchema.parse(result);
}

export async function testMarketplaceConnectivityClient(
  marketplace: 'amazon_br' | 'shopee_br',
  credentials?: SaveAmazonCredentialsBody | SaveShopeeCredentialsBody,
): Promise<MarketplaceConnectivityTestResponse> {
  const response = await adminClientFetch(
    `/api/admin/marketplace-credentials/${marketplace}/test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials ? { credentials } : {}),
    },
  );
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(readApiError(payload, 'Falha ao testar conectividade'));
  }
  const result: unknown = await response.json();
  return marketplaceConnectivityTestResponseSchema.parse(result);
}
