'use client';

import { adminClientFetch } from '@/lib/api/admin-client';
import {
  affiliateAccountsListResponseSchema,
  type AffiliateAccountDto,
  type CreateAffiliateAccountBody,
  type UpdateAffiliateAccountBody,
} from '@ecommerce-amazon/shared/admin';

export async function listAffiliateAccountsClient(): Promise<AffiliateAccountDto[]> {
  const response = await adminClientFetch('/api/admin/affiliate-accounts', { cache: 'no-store' });
  if (!response.ok) throw new Error('Falha ao carregar contas de afiliado');
  const payload: unknown = await response.json();
  const parsed = affiliateAccountsListResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Falha ao carregar contas de afiliado');
  return parsed.data.items;
}

export async function createAffiliateAccountClient(
  body: CreateAffiliateAccountBody,
): Promise<AffiliateAccountDto> {
  const response = await adminClientFetch('/api/admin/affiliate-accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao criar conta de afiliado');
  }
  return (await response.json()) as AffiliateAccountDto;
}

export async function updateAffiliateAccountClient(
  id: string,
  body: UpdateAffiliateAccountBody,
): Promise<AffiliateAccountDto> {
  const response = await adminClientFetch(`/api/admin/affiliate-accounts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao atualizar conta de afiliado');
  }
  return (await response.json()) as AffiliateAccountDto;
}

export async function deleteAffiliateAccountClient(id: string): Promise<void> {
  const response = await adminClientFetch(`/api/admin/affiliate-accounts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Falha ao excluir conta de afiliado');
  }
}
