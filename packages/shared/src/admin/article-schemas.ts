import { z } from 'zod';

import { ArticleStatus, ArticleType } from '@ecommerce-amazon/domain';

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

export const articlePublicDetailSchema = z.object({
  slug: articleSlugSchema,
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().nullable(),
  body: z.string(),
  type: articleTypeSchema,
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  authorName: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
});

export type ArticlePublicDetail = z.infer<typeof articlePublicDetailSchema>;

export const autoLinkItemSchema = z.object({
  keyword: z.string(),
  targetUrl: z.string(),
  maxMatches: z.number().int().positive(),
});

export const autoLinksResponseSchema = z.object({
  items: z.array(autoLinkItemSchema),
});

export type AutoLinksResponse = z.infer<typeof autoLinksResponseSchema>;
