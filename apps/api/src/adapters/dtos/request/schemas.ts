import { z } from 'zod';

export const ListProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  category: z.string().optional(),
  marketplace: z.enum(['amazon_br', 'shopee_br']).optional(),
  sort: z.enum(['editorial_score', 'price_updated_at']).optional(),
});

export const ProductSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const ProductIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const PriceHistoryQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).optional().default(90),
});

export const CreatePriceAlertSchema = z.object({
  email: z.string().email(),
  productId: z.string().uuid(),
  targetPrice: z.number().positive(),
});

export const ConfirmPriceAlertParamsSchema = z.object({
  token: z.string().min(1),
});

export const WishlistAddSchema = z.object({
  productId: z.string().uuid(),
});

export const WishlistRemoveParamsSchema = z.object({
  id: z.string().uuid(),
});

export const BatchCheckoutSchema = z.object({
  marketplace: z.enum(['amazon_br', 'shopee_br']),
});

export const CreateComparisonSchema = z.object({
  productIds: z.array(z.string().uuid()).min(2).max(3),
  editorialIntro: z.string().min(150),
});

export const ComparisonTokenParamsSchema = z.object({
  shareToken: z.string().min(1),
});

export const RecordClickSchema = z.object({
  productId: z.string().uuid(),
  origin: z.enum(['listagem', 'detalhe', 'embed', 'comparador', 'cupons']),
  sessionId: z.string().optional(),
  blockId: z.string().uuid().optional(),
});

export const ArticleSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CollectionSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CouponMarketplaceParamsSchema = z.object({
  marketplace: z.enum(['amazon_br', 'shopee_br']),
});

export const PageSlugParamsSchema = z.object({
  slug: z.string().min(1),
});
