import { z } from 'zod';

import {
  affiliateAccountsListResponseSchema,
  affiliateAccountSchema,
  type AffiliateAccountDto,
  type CreateAffiliateAccountBody,
  type UpdateAffiliateAccountBody,
} from '@ecommerce-amazon/shared/admin';

import { adminFetchParsed } from './admin-fetch';

export async function listAffiliateAccounts(): Promise<AffiliateAccountDto[]> {
  const response = await adminFetchParsed(
    '/admin/affiliate-accounts',
    affiliateAccountsListResponseSchema,
  );
  return response.items;
}

export async function createAffiliateAccount(
  body: CreateAffiliateAccountBody,
): Promise<AffiliateAccountDto> {
  return adminFetchParsed('/admin/affiliate-accounts', affiliateAccountSchema, {
    method: 'POST',
    body,
  });
}

export async function updateAffiliateAccount(
  id: string,
  body: UpdateAffiliateAccountBody,
): Promise<AffiliateAccountDto> {
  return adminFetchParsed(`/admin/affiliate-accounts/${id}`, affiliateAccountSchema, {
    method: 'PATCH',
    body,
  });
}

export async function deleteAffiliateAccount(id: string): Promise<{ deleted: true }> {
  return adminFetchParsed(
    `/admin/affiliate-accounts/${id}`,
    z.object({ deleted: z.literal(true) }),
    {
      method: 'DELETE',
    },
  );
}
