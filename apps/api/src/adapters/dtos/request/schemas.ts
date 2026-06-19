import { z } from 'zod';

import { BlockType } from '@ecommerce-amazon/domain';
import { clickPlacementSchema, recordEngagementEventSchema } from '@ecommerce-amazon/shared/analytics';

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
  search: z.string().trim().max(100).optional(),
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

export const CancelPriceAlertParamsSchema = ConfirmPriceAlertParamsSchema;

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

export const ComparisonIdentifierParamsSchema = z.object({
  identifier: z.string().min(1),
});

export const RecordClickSchema = z.object({
  productId: z.string().uuid(),
  origin: z.enum([
    'listagem',
    'detalhe',
    'embed',
    'comparador',
    'cupons',
    'coleção',
    'similar',
    'redirect_go',
  ]),
  sessionId: z.string().optional(),
  blockId: z.string().uuid().optional(),
  articleId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  placement: clickPlacementSchema.optional(),
  pagePath: z.string().max(512).optional(),
  referrerPath: z.string().max(512).optional(),
});

export const RecordEngagementSchema = recordEngagementEventSchema;

export const GoSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const GoQuerySchema = z.object({
  blockId: z.string().uuid().optional(),
  articleId: z.string().uuid().optional(),
  collectionId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  origin: z.string().optional(),
  placement: clickPlacementSchema.optional(),
  pagePath: z.string().max(512).optional(),
  referrerPath: z.string().max(512).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  comparisonSlug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export const ArticleSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const CollectionSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const GetCuratedCollectionQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
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
