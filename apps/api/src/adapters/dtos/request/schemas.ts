import { z } from 'zod';

import { BlockType } from '@ecommerce-amazon/domain';

export const ListProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  category: z.string().optional(),
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']).optional(),
  sort: z.enum(['editorial_score', 'price_updated_at']).optional(),
  visibleOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

export const CategorySlugParamsSchema = z.object({
  slug: z.string().min(1),
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
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']),
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
  origin: z.enum([
    'listagem',
    'detalhe',
    'embed',
    'comparador',
    'cupons',
    'redirect_go',
  ]),
  sessionId: z.string().optional(),
  blockId: z.string().uuid().optional(),
});

export const GoSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const GoQuerySchema = z.object({
  blockId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

export const ArticleSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CollectionSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CouponMarketplaceParamsSchema = z.object({
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']),
});

export const PageSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AdminPageSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const AdminPageBlockParamsSchema = z.object({
  slug: z.string().min(1),
  id: z.string().uuid(),
});

export const CreatePageBlockSchema = z.object({
  type: z.nativeEnum(BlockType),
  position: z.number().int().min(0),
  props: z.unknown(),
  visibility: z.enum(['all', 'desktop', 'mobile']).optional(),
});

export const UpdatePageBlockSchema = z.object({
  type: CreatePageBlockSchema.shape.type.optional(),
  position: z.number().int().min(0).optional(),
  props: z.unknown().optional(),
  visibility: z.enum(['all', 'desktop', 'mobile']).optional(),
});

export const ReorderPageBlocksSchema = z.object({
  blocksOrder: z
    .array(
      z.object({
        blockId: z.string().uuid(),
        position: z.number().int().min(0),
      }),
    )
    .min(1),
});
