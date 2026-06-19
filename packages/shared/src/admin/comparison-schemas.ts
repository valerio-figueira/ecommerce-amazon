import { z } from 'zod';

import { productPublicListItemSchema } from '../admin/product-schemas.js';

export const comparisonSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const comparisonStatusSchema = z.enum(['draft', 'published']);
export const comparisonSourceSchema = z.enum(['user_generated', 'curated']);

export const adminComparisonSummarySchema = z.object({
  id: z.string().uuid(),
  shareToken: z.string(),
  slug: comparisonSlugSchema.optional(),
  status: comparisonStatusSchema,
  source: comparisonSourceSchema,
  productCount: z.number().int().min(2).max(3),
  productTitles: z.array(z.string()),
  categoryLabel: z.string().optional(),
  updatedAt: z.string().datetime(),
});

export type AdminComparisonSummary = z.infer<typeof adminComparisonSummarySchema>;

export const adminComparisonsResponseSchema = z.object({
  items: z.array(adminComparisonSummarySchema),
});

export const adminComparisonDetailSchema = z.object({
  id: z.string().uuid(),
  shareToken: z.string(),
  slug: comparisonSlugSchema.optional(),
  status: comparisonStatusSchema,
  source: comparisonSourceSchema,
  editorialIntro: z.string(),
  productIds: z.array(z.string().uuid()).min(2).max(3),
  productTitles: z.array(z.string()),
  categoryLabel: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  showCategoryCarousel: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
});

export type AdminComparisonDetail = z.infer<typeof adminComparisonDetailSchema>;

const comparisonProductIdsSchema = z.array(z.string().uuid()).min(2).max(3);

export const createAdminComparisonBodySchema = z.object({
  productIds: comparisonProductIdsSchema,
  editorialIntro: z.string().trim().min(1),
  slug: comparisonSlugSchema.optional(),
  seoTitle: z.string().trim().max(150).optional(),
  seoDescription: z.string().trim().max(300).optional(),
  showCategoryCarousel: z.boolean().default(true),
});

export type CreateAdminComparisonBody = z.infer<typeof createAdminComparisonBodySchema>;

export const updateAdminComparisonBodySchema = createAdminComparisonBodySchema.partial();

export type UpdateAdminComparisonBody = z.infer<typeof updateAdminComparisonBodySchema>;

export const publishComparisonBodySchema = z.object({
  slug: comparisonSlugSchema,
});

export type PublishComparisonBody = z.infer<typeof publishComparisonBodySchema>;

export const comparisonIdParamsSchema = z.object({
  id: z.string().uuid(),
});
