import { z } from 'zod';

const articleCategorySlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const articleCategorySummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: articleCategorySlugSchema,
});

export type ArticleCategorySummary = z.infer<typeof articleCategorySummarySchema>;

export const articleCategoriesResponseSchema = z.object({
  items: z.array(articleCategorySummarySchema),
});

export const createArticleCategoryBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: articleCategorySlugSchema,
});

export type CreateArticleCategoryBody = z.infer<typeof createArticleCategoryBodySchema>;

export const updateArticleCategoryBodySchema = createArticleCategoryBodySchema.partial();

export type UpdateArticleCategoryBody = z.infer<typeof updateArticleCategoryBodySchema>;

export const articleCategoryIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createArticleCategoryResponseSchema = z.object({
  id: z.string().uuid(),
});

export type CreateArticleCategoryResponse = z.infer<typeof createArticleCategoryResponseSchema>;
