import { z } from 'zod';

export const categorySlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve ser kebab-case');

export const categoryBreadcrumbSchema = z.object({
  slug: z.string(),
  label: z.string(),
});

export type PublicCategoryTreeNode = {
  slug: string;
  label: string;
  icon?: string | undefined;
  productCount: number;
  subcategories?: PublicCategoryTreeNode[] | undefined;
};

export const publicCategoryTreeNodeSchema: z.ZodType<PublicCategoryTreeNode> = z.lazy(() =>
  z.object({
    slug: z.string(),
    label: z.string(),
    icon: z.string().optional(),
    productCount: z.number().int().nonnegative(),
    subcategories: z.array(publicCategoryTreeNodeSchema).optional(),
  }),
);

export const publicCategoryTreeResponseSchema = z.object({
  items: z.array(publicCategoryTreeNodeSchema),
});

export const publicCategoryDetailSchema = z.object({
  slug: z.string(),
  label: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  descriptionHtml: z.string().optional(),
  productCount: z.number().int().nonnegative(),
  breadcrumbs: z.array(categoryBreadcrumbSchema),
  children: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
      productCount: z.number().int().nonnegative(),
    }),
  ),
});

export type PublicCategoryDetail = z.infer<typeof publicCategoryDetailSchema>;
