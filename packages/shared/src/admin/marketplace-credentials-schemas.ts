import { z } from 'zod';

export const marketplaceCredentialHealthStatusSchema = z.enum([
  'not_configured',
  'connected',
  'error',
]);

export const marketplaceCredentialAuthTypeSchema = z.enum(['static_keys', 'oauth']);

export const marketplaceCredentialMarketplaceSchema = z.enum([
  'amazon_br',
  'shopee_br',
  'mercadolivre_br',
]);

export const amazonStaticCredentialsBodySchema = z.object({
  accessKeyId: z.string().trim().min(16).max(128),
  secretAccessKey: z.string().trim().min(16).max(256),
  host: z.string().trim().max(255).optional(),
  region: z.string().trim().max(64).optional(),
});

export const shopeeStaticCredentialsBodySchema = z.object({
  partnerId: z.string().trim().min(1).max(64),
  partnerKey: z.string().trim().min(8).max(256),
});

export const saveAmazonCredentialsBodySchema = amazonStaticCredentialsBodySchema;

export const saveShopeeCredentialsBodySchema = shopeeStaticCredentialsBodySchema;

export const marketplaceCredentialPublicMetadataSchema = z.record(z.string(), z.unknown());

export const marketplaceCredentialStatusSchema = z.object({
  marketplace: marketplaceCredentialMarketplaceSchema,
  authType: marketplaceCredentialAuthTypeSchema,
  configured: z.boolean(),
  publicMetadata: marketplaceCredentialPublicMetadataSchema,
  healthStatus: marketplaceCredentialHealthStatusSchema,
  healthMessage: z.string().nullable(),
  lastHealthCheckAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export const marketplaceCredentialsListResponseSchema = z.object({
  items: z.array(marketplaceCredentialStatusSchema),
});

export const marketplaceConnectivityTestBodySchema = z
  .object({
    credentials: z.union([amazonStaticCredentialsBodySchema, shopeeStaticCredentialsBodySchema]).optional(),
  })
  .optional();

export const marketplaceConnectivityTestResponseSchema = z.object({
  ok: z.boolean(),
  httpStatus: z.number().int().optional(),
  message: z.string(),
  rateLimitHint: z.string().optional(),
});

export type MarketplaceCredentialStatusDto = z.infer<typeof marketplaceCredentialStatusSchema>;
export type SaveAmazonCredentialsBody = z.infer<typeof saveAmazonCredentialsBodySchema>;
export type SaveShopeeCredentialsBody = z.infer<typeof saveShopeeCredentialsBodySchema>;
export type MarketplaceConnectivityTestResponse = z.infer<
  typeof marketplaceConnectivityTestResponseSchema
>;
