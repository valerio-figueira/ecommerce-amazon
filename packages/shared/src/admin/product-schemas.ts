import { z } from 'zod';

import { MARKETPLACE_VALUES } from '../marketplace/constants.js';

export const marketplaceSchema = z.enum(MARKETPLACE_VALUES);

export const productAvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'unknown']);

export const createProductBodySchema = z
  .object({
    affiliateLink: z.string().url().startsWith('https://'),
    marketplace: marketplaceSchema,
    externalId: z.string().min(1),
    titleClean: z.string().min(3).max(200),
    categoryId: z.string().uuid().optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    images: z
      .array(z.string())
      .default([])
      .transform((items) =>
        items.map((item) => item.trim()).filter((item) => item.length > 0),
      )
      .pipe(z.array(z.string().url())),
    editorialScore: z.number().min(0).max(10),
    pros: z
      .array(z.string())
      .default([])
      .transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0)),
    cons: z
      .array(z.string())
      .default([])
      .transform((items) => items.map((item) => item.trim()).filter((item) => item.length > 0)),
    shortDescription: z.string().max(500).default(''),
    longDescriptionHtml: z.string().max(50000).default(''),
    metaTitle: z.string().max(200).default(''),
    metaDescription: z.string().max(320).default(''),
    specsNormalized: z
      .record(z.string(), z.string())
      .default({})
      .transform((record) =>
        Object.fromEntries(
          Object.entries(record)
            .map(([key, value]) => [key.trim(), value.trim()] as const)
            .filter(([key, value]) => key.length > 0 && value.length > 0),
        ),
      ),
    price: z.number().min(0),
    strikethroughPrice: z.number().min(0).optional(),
    shouldShowPrice: z.boolean(),
    visible: z.boolean(),
    availability: productAvailabilitySchema,
  })
  .superRefine((data, ctx) => {
    if (data.shouldShowPrice && data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe um preço válido para exibir na vitrine',
        path: ['price'],
      });
    }
    if (
      data.strikethroughPrice !== undefined &&
      data.strikethroughPrice > 0 &&
      data.strikethroughPrice <= data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Preço de tabela deve ser maior que o preço atual',
        path: ['strikethroughPrice'],
      });
    }
  });

export type CreateProductBody = z.infer<typeof createProductBodySchema>;

export const updateProductBodySchema = createProductBodySchema;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;

export const adminProductSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const adminProductDetailSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  affiliateLink: z.string().url(),
  marketplace: marketplaceSchema,
  externalId: z.string(),
  titleClean: z.string(),
  categoryId: z.string().uuid().optional(),
  images: z.array(z.string().url()),
  editorialScore: z.number().min(0).max(10),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  shortDescription: z.string().optional(),
  longDescriptionHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  specsNormalized: z.record(z.string(), z.string()),
  price: z.number().min(0),
  strikethroughPrice: z.number().min(0).optional(),
  shouldShowPrice: z.boolean(),
  visible: z.boolean(),
  availability: productAvailabilitySchema,
  createdAt: z.string(),
});

export type AdminProductDetail = z.infer<typeof adminProductDetailSchema>;

export const createProductResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
});

export const updateProductResponseSchema = createProductResponseSchema;
export type UpdateProductResponse = z.infer<typeof updateProductResponseSchema>;

export const adminProductPriceSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string(),
  isStale: z.boolean(),
  updatedAt: z.string(),
  strikethrough: z.number().optional(),
});

export const adminProductListItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  marketplace: marketplaceSchema,
  externalId: z.string(),
  affiliateLink: z.string().url(),
  price: adminProductPriceSchema,
  availability: productAvailabilitySchema,
  editorialScore: z.number(),
  visible: z.boolean(),
  imageUrl: z.string().url().optional(),
  createdAt: z.string(),
});

export const adminProductListResponseSchema = z.object({
  items: z.array(adminProductListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type AdminProductListItem = z.infer<typeof adminProductListItemSchema>;
export type AdminProductListResponse = z.infer<typeof adminProductListResponseSchema>;
export type CreateProductResponse = z.infer<typeof createProductResponseSchema>;

export const productPublicPriceSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string(),
  isStale: z.boolean(),
  updatedAt: z.string(),
  strikethrough: z.number().optional(),
});

export const productPublicListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  price: productPublicPriceSchema,
  marketplace: z.string(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  imageUrl: z.string().optional(),
  goUrl: z.string(),
  editorialScore: z.number(),
  visible: z.boolean().optional(),
});

export const productPublicCategorySummarySchema = z.object({
  slug: z.string(),
  label: z.string(),
  breadcrumbs: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
    }),
  ),
});

export const productPublicDetailSchema = productPublicListItemSchema.extend({
  titleRaw: z.string(),
  externalId: z.string(),
  availability: z.string(),
  shortDescription: z.string().optional(),
  longDescriptionHtml: z.string().optional(),
  images: z.array(z.string()),
  specs: z.record(z.string()),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  category: productPublicCategorySummarySchema.optional(),
  similarProducts: z.array(productPublicListItemSchema),
});

export type ProductPublicDetail = z.infer<typeof productPublicDetailSchema>;

export const adminListProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  marketplace: marketplaceSchema.optional(),
  sort: z
    .enum([
      'editorial_score',
      'price_updated_at',
      'created_at',
      'price_asc',
      'price_desc',
    ])
    .optional(),
});
