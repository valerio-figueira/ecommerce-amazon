import { z } from 'zod';

import {
  affiliateAccountsListResponseSchema,
  type AffiliateAccountDto,
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

export async function updateAffiliateAccount(
  id: string,
  body: UpdateAffiliateAccountBody,
): Promise<AffiliateAccountDto> {
  return adminFetchParsed(`/admin/affiliate-accounts/${id}`, z.object({
    id: z.string().uuid(),
    marketplace: z.string(),
    affiliateTag: z.string(),
    status: z.string(),
    validatedBy: z.string().nullable(),
    validatedAt: z.string().datetime().nullable(),
    validationNotes: z.string().nullable(),
  }), {
    method: 'PATCH',
    body,
  });
}
