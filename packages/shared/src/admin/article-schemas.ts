import { z } from 'zod';

import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';

import { productPublicDetailSchema } from './product-schemas.js';
import { articleClusterPublicSchema } from './content-cluster-schemas.js';

const articleSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const articleTypeSchema = z.nativeEnum(ArticleType);
export const articleStatusSchema = z.nativeEnum(ArticleStatus);

export const adminArticleSummarySchema = z.object({
  id: z.string().uuid(),
  slug: articleSlugSchema,
  title: z.string(),
  excerpt: z.string(),
  status: articleStatusSchema,
  coverImageUrl: z.string().nullable(),
  updatedAt: z.string().datetime(),
});

export type AdminArticleSummary = z.infer<typeof adminArticleSummarySchema>;

export const adminArticlesResponseSchema = z.object({
  items: z.array(adminArticleSummarySchema),
});

export const adminArticlesListResponseSchema = z.object({
  items: z.array(adminArticleSummarySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type AdminArticlesListResponse = z.infer<typeof adminArticlesListResponseSchema>;

export const adminListArticlesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().max(100).optional(),
  status: articleStatusSchema.optional(),
});

export const adminArticleDetailSchema = z.object({
  id: z.string().uuid(),
  slug: articleSlugSchema,
  title: z.string().trim().min(1).max(150),
  excerpt: z.string().trim().max(500),
  coverImageUrl: z.string().trim().url().max(500).nullable(),
  body: z.string().trim().min(1),
  type: articleTypeSchema,
  status: articleStatusSchema,
  seoTitle: z.string().trim().max(200).nullable(),
  seoDescription: z.string().trim().max(500).nullable(),
  authorId: z.string().uuid().nullable(),
  categoryId: z.string().uuid().nullable(),
  clusterId: z.string().uuid().nullable(),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminArticleDetail = z.infer<typeof adminArticleDetailSchema>;

export const createArticleBodySchema = z.object({
  slug: articleSlugSchema,
  title: z.string().trim().min(1).max(150),
  excerpt: z.string().trim().max(500).default(''),
  coverImageUrl: z.string().trim().url().max(500).nullable().optional(),
  body: z.string().trim().min(1),
  type: articleTypeSchema,
  status: articleStatusSchema.default(ArticleStatus.DRAFT),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  clusterId: z.string().uuid().nullable().optional(),
});

export type CreateArticleBody = z.infer<typeof createArticleBodySchema>;

export const updateArticleBodySchema = createArticleBodySchema.partial();

export type UpdateArticleBody = z.infer<typeof updateArticleBodySchema>;

export const articleIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createArticleResponseSchema = z.object({
  id: z.string().uuid(),
});

export type CreateArticleResponse = z.infer<typeof createArticleResponseSchema>;

export const articleAuthorSchema = z.object({
  name: z.string(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
});

export type ArticleAuthorPublic = z.infer<typeof articleAuthorSchema>;

export const articleCategoryPublicSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type ArticleCategoryPublic = z.infer<typeof articleCategoryPublicSchema>;

export const articleRelatedSummarySchema = z.object({
  id: z.string().uuid(),
  slug: articleSlugSchema,
  title: z.string(),
  coverImageUrl: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
});

export type ArticleRelatedSummary = z.infer<typeof articleRelatedSummarySchema>;

export const articlesByCategoryResponseSchema = z.object({
  category: articleCategoryPublicSchema,
  items: z.array(articleRelatedSummarySchema),
});

export type ArticlesByCategoryResponse = z.infer<typeof articlesByCategoryResponseSchema>;

export const listArticlesByCategoryQuerySchema = z.object({
  category: articleSlugSchema,
});

export const listPublishedArticlesQuerySchema = z.object({
  category: articleSlugSchema.optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListPublishedArticlesQuery = z.infer<typeof listPublishedArticlesQuerySchema>;

export const publishedArticleListItemSchema = articleRelatedSummarySchema.extend({
  excerpt: z.string(),
  category: articleCategoryPublicSchema.nullable(),
});

export type PublishedArticleListItem = z.infer<typeof publishedArticleListItemSchema>;

export const publishedArticlesListResponseSchema = z.object({
  items: z.array(publishedArticleListItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type PublishedArticlesListResponse = z.infer<typeof publishedArticlesListResponseSchema>;

export const publicArticleCategoriesResponseSchema = z.object({
  items: z.array(articleCategoryPublicSchema),
});

export type PublicArticleCategoriesResponse = z.infer<typeof publicArticleCategoriesResponseSchema>;

export function toIsoDateTime(
  value: Date | string | null | undefined,
  fallback?: Date | string | null,
): string {
  const resolved = value ?? fallback;
  if (resolved instanceof Date) {
    return resolved.toISOString();
  }
  if (typeof resolved === 'string' && resolved.length > 0) {
    return resolved;
  }
  if (fallback instanceof Date) {
    return fallback.toISOString();
  }
  if (typeof fallback === 'string' && fallback.length > 0) {
    return fallback;
  }
  return new Date().toISOString();
}

export function resolveArticleUpdatedAtIso(input: {
  updatedAt?: string | null | undefined;
  publishedAt?: string | null | undefined;
}): string {
  return toIsoDateTime(input.updatedAt, input.publishedAt);
}

export const articlePublicDetailSchema = z
  .object({
  id: z.string().uuid(),
  slug: articleSlugSchema,
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().nullable(),
  body: z.string(),
  type: articleTypeSchema,
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  author: articleAuthorSchema.nullable(),
  category: articleCategoryPublicSchema.nullable(),
  relatedArticles: z.array(articleRelatedSummarySchema),
  publishedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().optional(),
  embeddedProducts: z.record(z.string(), productPublicDetailSchema.nullable()),
  cluster: articleClusterPublicSchema.nullable(),
})
  .transform((data) => ({
    ...data,
    updatedAt: resolveArticleUpdatedAtIso(data),
  }));

export type ArticlePublicDetail = z.output<typeof articlePublicDetailSchema>;

export const autoLinkItemSchema = z.object({
  keyword: z.string(),
  targetUrl: z.string(),
  maxMatches: z.number().int().positive(),
  priority: z.number().int().optional(),
});

export const autoLinksResponseSchema = z.object({
  items: z.array(autoLinkItemSchema),
});

export type AutoLinksResponse = z.infer<typeof autoLinksResponseSchema>;
