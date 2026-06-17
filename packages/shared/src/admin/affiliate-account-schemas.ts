import { z } from 'zod';

export const affiliateAccountStatusSchema = z.enum([
  'pending_manual_validation',
  'active',
  'suspended',
]);

export const affiliateAccountSchema = z.object({
  id: z.string().uuid(),
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']),
  affiliateTag: z.string().min(1),
  status: affiliateAccountStatusSchema,
  validatedBy: z.string().nullable(),
  validatedAt: z.string().datetime().nullable(),
  validationNotes: z.string().nullable(),
});

export type AffiliateAccountDto = z.infer<typeof affiliateAccountSchema>;

export const affiliateAccountsListResponseSchema = z.object({
  items: z.array(affiliateAccountSchema),
});

export const updateAffiliateAccountBodySchema = z.object({
  affiliateTag: z.string().trim().min(1).max(120).optional(),
  status: affiliateAccountStatusSchema.optional(),
  validationNotes: z.string().trim().max(2000).nullable().optional(),
  checklistConfirmed: z.boolean().optional(),
});

export type UpdateAffiliateAccountBody = z.infer<typeof updateAffiliateAccountBodySchema>;
