import { z } from 'zod';

import { toIsoDateTime } from '../admin/article-schemas.js';
import { productPublicDetailSchema, productPublicListItemSchema } from '../admin/product-schemas.js';

import { comparisonSlugSchema, comparisonSourceSchema, comparisonStatusSchema } from '../admin/comparison-schemas.js';

export function resolveComparisonCanonicalPath(input: {
  canonicalPath?: string | undefined;
  shareToken: string;
  slug?: string | undefined;
  status?: z.infer<typeof comparisonStatusSchema> | undefined;
}): string {
  if (input.canonicalPath !== undefined && input.canonicalPath.length > 0) {
    return input.canonicalPath;
  }
  if (input.status === 'published' && input.slug) {
    return `/comparar/${input.slug}`;
  }
  return `/comparar/${input.shareToken}`;
}

export function resolveComparisonUpdatedAtIso(input: {
  updatedAt?: string | null | undefined;
  createdAt: string;
}): string {
  return toIsoDateTime(input.updatedAt, input.createdAt);
}

export const comparisonPublicDetailSchema = z
  .object({
    shareToken: z.string(),
    slug: comparisonSlugSchema.optional(),
    status: comparisonStatusSchema.optional(),
    source: comparisonSourceSchema.optional(),
    editorialIntro: z.string(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    publishedAt: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    showCategoryCarousel: z.boolean().optional(),
    canonicalPath: z.string().optional(),
    categorySlug: z.string().optional(),
    categoryLabel: z.string().optional(),
    relatedProducts: z.array(productPublicListItemSchema).optional(),
    products: z.array(productPublicDetailSchema),
  })
  .transform((data) => {
    const status = data.status ?? 'draft';
    return {
      ...data,
      status,
      showCategoryCarousel: data.showCategoryCarousel ?? true,
      updatedAt: resolveComparisonUpdatedAtIso(data),
      canonicalPath: resolveComparisonCanonicalPath({
        canonicalPath: data.canonicalPath,
        shareToken: data.shareToken,
        slug: data.slug,
        status,
      }),
    };
  });

export const createComparisonResponseSchema = z.object({
  shareToken: z.string(),
  id: z.string(),
});

export type ComparisonPublicDetail = z.output<typeof comparisonPublicDetailSchema>;
export type CreateComparisonResponse = z.infer<typeof createComparisonResponseSchema>;
