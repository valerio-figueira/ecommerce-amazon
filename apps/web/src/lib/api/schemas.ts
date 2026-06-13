import { z } from 'zod';

const productPriceSchema = z.object({
  amount: z.number().nullable(),
  currency: z.string(),
  isStale: z.boolean(),
  updatedAt: z.string(),
  strikethrough: z.number().optional(),
});

export const productListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  price: productPriceSchema,
  marketplace: z.string(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  imageUrl: z.string().optional(),
  goUrl: z.string(),
  editorialScore: z.number(),
  visible: z.boolean().optional(),
});

export const productsPageSchema = z.object({
  items: z.array(productListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const categorySchema = z.object({
  slug: z.string(),
  label: z.string(),
  count: z.number(),
});

export const categoriesSchema = z.array(categorySchema);

export const categoriesResponseSchema = z.object({
  items: categoriesSchema,
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

export const productDetailSchema = productListItemSchema.extend({
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
});

export type ProductListItemDto = z.infer<typeof productListItemSchema>;
export type ProductDetailDto = z.infer<typeof productDetailSchema>;
export type ProductsPageDto = z.infer<typeof productsPageSchema>;
export type CategoryDto = z.infer<typeof categorySchema>;
export type WishlistItemDto = z.infer<typeof wishlistItemSchema>;
