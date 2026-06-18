import { z } from 'zod';

import {
  productPublicDetailSchema,
  productPublicListItemSchema,
} from '@ecommerce-amazon/shared/admin';
import {
  publicCategoryTreeNodeSchema,
  publicCategoryDetailSchema,
  type PublicCategoryTreeNode,
} from '@ecommerce-amazon/shared/category/category-schemas';

export const productListItemSchema = productPublicListItemSchema;

export const productsPageSchema = z.object({
  items: z.array(productListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type CategoryTreeNodeDto = PublicCategoryTreeNode;

export const curatedCollectionDetailSchema = z.object({
  collection: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    coverImageUrl: z.string(),
    campaignOrigin: z.string(),
    utmDefaults: z.record(z.string(), z.string()),
    ctaText: z.string(),
    updatedAt: z.string(),
  }),
  products: z.array(productListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type CuratedCollectionDetailDto = z.infer<typeof curatedCollectionDetailSchema>;

export const categorySchema = z.object({
  slug: z.string(),
  label: z.string(),
  productCount: z.number().optional(),
});

export const categoriesResponseSchema = z.object({
  items: z.array(publicCategoryTreeNodeSchema),
});

export const categoryDetailSchema = publicCategoryDetailSchema;

export const productCategorySummarySchema = z.object({
  slug: z.string(),
  label: z.string(),
  breadcrumbs: z.array(
    z.object({
      slug: z.string(),
      label: z.string(),
    }),
  ),
});

const wishlistProductSchema = z.object({
  slug: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  price: z.object({
    amount: z.number().nullable(),
    currency: z.string(),
    isStale: z.boolean(),
  }),
  goUrl: z.string(),
});

export const wishlistItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  marketplace: z.string(),
  sortOrder: z.number(),
  addedAt: z.string(),
  product: wishlistProductSchema,
});

export const wishlistResponseSchema = z.object({
  items: z.array(wishlistItemSchema),
});

export const productDetailSchema = productPublicDetailSchema;

export type ProductListItemDto = z.infer<typeof productListItemSchema>;
export type ProductDetailDto = z.infer<typeof productDetailSchema>;
export type ProductsPageDto = z.infer<typeof productsPageSchema>;
export type CategoryDto = z.infer<typeof categorySchema>;
export type CategoryDetailDto = z.infer<typeof categoryDetailSchema>;
export type WishlistItemDto = z.infer<typeof wishlistItemSchema>;
