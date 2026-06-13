import { z } from 'zod';

import { categorySlugSchema } from '../category/category-schemas.js';

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

const optionalNullableTrimmedString = (_max: number) => z.string().optional();

export const adminCategorySchema = z.object({
  id: z.string().uuid(),
  slug: categorySlugSchema,
  label: z.string().trim().min(1).max(100),
  icon: optionalTrimmedString(50),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  seoTitle: optionalTrimmedString(150),
  seoDescription: optionalTrimmedString(2000),
  descriptionHtml: optionalTrimmedString(50000),
  amazonBrowseNode: optionalTrimmedString(50),
  mercadolivreCategoryId: optionalTrimmedString(50),
  shopeeCategoryId: optionalTrimmedString(50),
  visible: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AdminCategory = z.infer<typeof adminCategorySchema>;

export const adminCategoryTreeNodeSchema = z.lazy(() =>
  adminCategorySchema.extend({
    subcategories: z.array(adminCategoryTreeNodeSchema).optional(),
  }),
) as z.ZodType<AdminCategoryTreeNode>;

export type AdminCategoryTreeNode = z.infer<typeof adminCategorySchema> & {
  subcategories?: AdminCategoryTreeNode[] | undefined;
};

export const adminCategoriesResponseSchema = z.object({
  items: z.array(adminCategoryTreeNodeSchema),
});

export const createCategoryBodySchema = z.object({
  slug: categorySlugSchema,
  label: z.string().trim().min(1).max(100),
  icon: optionalTrimmedString(50),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  seoTitle: optionalTrimmedString(150),
  seoDescription: optionalTrimmedString(2000),
  descriptionHtml: optionalTrimmedString(50000),
  amazonBrowseNode: optionalTrimmedString(50),
  mercadolivreCategoryId: optionalTrimmedString(50),
  shopeeCategoryId: optionalTrimmedString(50),
  visible: z.boolean().optional(),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = createCategoryBodySchema.partial();

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;

export const categoryIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const reorderCategoriesBodySchema = z.object({
  parentId: z.string().uuid().nullable().optional(),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        sortOrder: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

export type ReorderCategoriesBody = z.infer<typeof reorderCategoriesBodySchema>;

export const adminCategoryFlatOptionSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  label: z.string(),
  depth: z.number().int().nonnegative(),
  isLeaf: z.boolean(),
});

export type AdminCategoryFlatOption = z.infer<typeof adminCategoryFlatOptionSchema>;
