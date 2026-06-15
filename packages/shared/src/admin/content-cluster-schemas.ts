import { z } from 'zod';

const clusterSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(150)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const contentClusterAdminSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: clusterSlugSchema,
  pilarTitle: z.string().nullable(),
  memberCount: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type ContentClusterAdminSummary = z.infer<typeof contentClusterAdminSummarySchema>;

export const contentClustersAdminResponseSchema = z.object({
  items: z.array(contentClusterAdminSummarySchema),
});

export type ContentClustersAdminResponse = z.infer<typeof contentClustersAdminResponseSchema>;

export const contentClusterMemberAdminSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
  status: z.enum(['draft', 'published']),
  isPilar: z.boolean(),
});

export type ContentClusterMemberAdmin = z.infer<typeof contentClusterMemberAdminSchema>;

export const contentClusterAdminDetailSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: clusterSlugSchema,
  description: z.string().nullable(),
  pilarArticleId: z.string().uuid().nullable(),
  members: z.array(contentClusterMemberAdminSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ContentClusterAdminDetail = z.infer<typeof contentClusterAdminDetailSchema>;

export const createContentClusterBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: clusterSlugSchema,
  description: z.string().trim().max(2000).nullable().optional(),
  pilarArticleId: z.string().uuid().nullable().optional(),
});

export type CreateContentClusterBody = z.infer<typeof createContentClusterBodySchema>;

export const updateContentClusterBodySchema = createContentClusterBodySchema.partial();

export type UpdateContentClusterBody = z.infer<typeof updateContentClusterBodySchema>;

export const contentClusterIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createContentClusterResponseSchema = z.object({
  id: z.string().uuid(),
});

export type CreateContentClusterResponse = z.infer<typeof createContentClusterResponseSchema>;

export const contentClusterSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: clusterSlugSchema,
});

export type ContentClusterSummary = z.infer<typeof contentClusterSummarySchema>;

export const contentClustersSummaryResponseSchema = z.object({
  items: z.array(contentClusterSummarySchema),
});

export type ContentClustersSummaryResponse = z.infer<typeof contentClustersSummaryResponseSchema>;

export const articleClusterMemberSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().nullable(),
  publishedAt: z.string().datetime().nullable(),
  isPilar: z.boolean(),
});

export type ArticleClusterMember = z.infer<typeof articleClusterMemberSchema>;

export const articleClusterPublicSchema = z.object({
  name: z.string(),
  slug: clusterSlugSchema,
  description: z.string().nullable(),
  role: z.enum(['pilar', 'spoke']),
  pilarArticle: z.object({
    slug: z.string(),
    title: z.string(),
  }),
  members: z.array(articleClusterMemberSchema),
});

export type ArticleClusterPublic = z.infer<typeof articleClusterPublicSchema>;
