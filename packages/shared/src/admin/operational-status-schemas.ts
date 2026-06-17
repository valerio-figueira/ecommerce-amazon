import { z } from 'zod';

import { affiliateAccountStatusSchema } from './affiliate-account-schemas.js';

export const operationalEnvFlagsSchema = z.object({
  resendConfigured: z.boolean(),
  ga4Configured: z.boolean(),
  storageDriver: z.string(),
});

export const affiliateGateStatusSchema = z.object({
  readyForScale: z.boolean(),
  pendingMarketplaces: z.array(z.string()),
  accounts: z.array(
    z.object({
      marketplace: z.string(),
      status: affiliateAccountStatusSchema,
    }),
  ),
});

export const syncJobFailureSchema = z.object({
  id: z.string().uuid(),
  jobType: z.string(),
  status: z.string(),
  itemsProcessed: z.number().int(),
  errors: z.array(z.unknown()),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime().nullable(),
});

export const operationalStatusResponseSchema = z.object({
  env: operationalEnvFlagsSchema,
  affiliateGate: affiliateGateStatusSchema,
  recentSyncFailures: z.array(syncJobFailureSchema),
});

export type OperationalStatusResponse = z.infer<typeof operationalStatusResponseSchema>;
