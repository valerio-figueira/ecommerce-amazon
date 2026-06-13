import { z } from 'zod';

const collectionSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const campaignOriginSchema = z.enum(['pinterest', 'tiktok', 'instagram', 'organico']);

export const adminCollectionSchema = z.object({
  id: z.string().uuid(),
  slug: collectionSlugSchema,
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(5000),
  coverImageUrl: z.string().trim().url().max(500),
  campaignOrigin: campaignOriginSchema,
  utmDefaults: z.record(z.string(), z.string()),
  ctaText: z.string().trim().min(1).max(200),
  productIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminCollection = z.infer<typeof adminCollectionSchema>;

export const adminCollectionSummarySchema = z.object({
  id: z.string().uuid(),
  slug: collectionSlugSchema,
  title: z.string(),
  coverImageUrl: z.string(),
  productCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type AdminCollectionSummary = z.infer<typeof adminCollectionSummarySchema>;

export const adminCollectionsResponseSchema = z.object({
  items: z.array(adminCollectionSummarySchema),
});

export const publicCollectionSummarySchema = z.object({
  slug: collectionSlugSchema,
  title: z.string(),
  coverImageUrl: z.string(),
});

export const publicCollectionsResponseSchema = z.object({
  items: z.array(publicCollectionSummarySchema),
});

export const createCollectionBodySchema = z.object({
  slug: collectionSlugSchema,
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(5000),
  coverImageUrl: z.string().trim().url().max(500),
  campaignOrigin: campaignOriginSchema,
  utmDefaults: z.record(z.string(), z.string()).default({}),
  ctaText: z.string().trim().min(1).max(200),
  productIds: z.array(z.string().uuid()).min(1, 'At least one product is required'),
});

export type CreateCollectionBody = z.infer<typeof createCollectionBodySchema>;

export const updateCollectionBodySchema = createCollectionBodySchema.partial();

export type UpdateCollectionBody = z.infer<typeof updateCollectionBodySchema>;

export const collectionIdParamsSchema = z.object({
  id: z.string().uuid(),
});
