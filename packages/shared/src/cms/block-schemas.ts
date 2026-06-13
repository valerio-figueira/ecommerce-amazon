import { z } from 'zod';

import { BlockType } from '@ecommerce-amazon/domain';

const heroSlideSchema = z.object({
  imageUrl: z.string().url(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  linkedProductSlug: z.string().optional(),
});

export const heroCarouselPropsSchema = z.object({
  slides: z.array(heroSlideSchema).min(1),
  autoplay: z.boolean().default(true),
  intervalMs: z.number().int().positive().default(5000),
});

export const featuredProductPropsSchema = z.object({
  productSlug: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  showMarketplaceBadge: z.boolean().default(true),
  ctaLabel: z.string().optional(),
});

export const productGridPropsSchema = z.object({
  title: z.string().min(1),
  categorySlug: z.string().nullable().optional(),
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']).optional(),
  sort: z.enum(['editorial_score', 'price_updated_at']).default('editorial_score'),
  pageSize: z.number().int().min(4).max(24).default(12),
  columns: z.union([z.literal(2), z.literal(4)]).default(4),
});

export const categoryPillsPropsSchema = z.object({
  title: z.string().optional(),
  categorySlugs: z.array(z.string()).min(1),
  linkedBlockId: z.string().uuid().optional(),
  mode: z.enum(['filter', 'link']).default('filter'),
  showSubcategories: z.boolean().default(true),
});

export const categoryBentoTileSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  href: z.string().optional(),
  categorySlug: z.string().optional(),
  size: z.enum(['small', 'large']).default('small'),
});

export const categoryBentoGridPropsSchema = z.object({
  title: z.string().min(1),
  tiles: z.array(categoryBentoTileSchema).min(1).max(8),
});

export const heroSplitPropsSchema = z.object({
  ratio: z.enum(['2/1', '1/1']).default('2/1'),
  leftBlockId: z.string().uuid(),
  rightBlockId: z.string().uuid(),
});

export const curatedCollectionPropsSchema = z.object({
  collectionSlug: z.string().min(1),
  layout: z.enum(['carousel', 'grid']).default('grid'),
});

export const couponStripPropsSchema = z.object({
  marketplace: z.enum(['amazon_br', 'shopee_br', 'mercadolivre_br']).optional(),
  maxItems: z.number().int().min(1).max(10).default(5),
});

export const richTextPropsSchema = z.object({
  html: z.string().min(1),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

export const bannerPropsSchema = z.object({
  imageUrl: z.string().url(),
  href: z.string().url(),
  alt: z.string().min(1),
});

export const spacerPropsSchema = z.object({
  size: z.enum(['sm', 'md', 'lg']).default('md'),
});

export const dynamicProductGridPropsSchema = z.object({
  title: z.string().min(3).max(60),
  subtitle: z.string().optional(),
  categoryVertical: z.string().optional(),
  minDiscountPercentage: z.number().min(0).max(100).optional(),
  sortBy: z
    .enum(['editorial_score', 'created_at', 'price_asc', 'price_desc'])
    .default('editorial_score'),
  limit: z.number().int().min(1).max(24).default(8),
});

/** @deprecated Use dynamicProductGridPropsSchema */
export const DynamicProductGridPropsSchema = dynamicProductGridPropsSchema;

export type HeroCarouselProps = z.infer<typeof heroCarouselPropsSchema>;
export type FeaturedProductProps = z.infer<typeof featuredProductPropsSchema>;
export type ProductGridProps = z.infer<typeof productGridPropsSchema>;
export type CategoryPillsProps = z.infer<typeof categoryPillsPropsSchema>;
export type CategoryBentoTile = z.infer<typeof categoryBentoTileSchema>;
export type CategoryBentoGridProps = z.infer<typeof categoryBentoGridPropsSchema>;
export type HeroSplitProps = z.infer<typeof heroSplitPropsSchema>;
export type CuratedCollectionProps = z.infer<typeof curatedCollectionPropsSchema>;
export type CouponStripProps = z.infer<typeof couponStripPropsSchema>;
export type RichTextProps = z.infer<typeof richTextPropsSchema>;
export type BannerProps = z.infer<typeof bannerPropsSchema>;
export type SpacerProps = z.infer<typeof spacerPropsSchema>;
export type DynamicProductGridProps = z.infer<typeof dynamicProductGridPropsSchema>;

export type BlockPropsMap = {
  [BlockType.HERO_CAROUSEL]: HeroCarouselProps;
  [BlockType.FEATURED_PRODUCT]: FeaturedProductProps;
  [BlockType.PRODUCT_GRID]: ProductGridProps;
  [BlockType.CATEGORY_PILLS]: CategoryPillsProps;
  [BlockType.CATEGORY_BENTO_GRID]: CategoryBentoGridProps;
  [BlockType.HERO_SPLIT]: HeroSplitProps;
  [BlockType.CURATED_COLLECTION]: CuratedCollectionProps;
  [BlockType.COUPON_STRIP]: CouponStripProps;
  [BlockType.RICH_TEXT]: RichTextProps;
  [BlockType.BANNER]: BannerProps;
  [BlockType.SPACER]: SpacerProps;
  [BlockType.DYNAMIC_PRODUCT_GRID]: DynamicProductGridProps;
};

export const BlockPropsResolver: Record<BlockType, z.ZodType<unknown>> = {
  [BlockType.HERO_CAROUSEL]: heroCarouselPropsSchema,
  [BlockType.FEATURED_PRODUCT]: featuredProductPropsSchema,
  [BlockType.PRODUCT_GRID]: productGridPropsSchema,
  [BlockType.CATEGORY_PILLS]: categoryPillsPropsSchema,
  [BlockType.CATEGORY_BENTO_GRID]: categoryBentoGridPropsSchema,
  [BlockType.HERO_SPLIT]: heroSplitPropsSchema,
  [BlockType.CURATED_COLLECTION]: curatedCollectionPropsSchema,
  [BlockType.COUPON_STRIP]: couponStripPropsSchema,
  [BlockType.RICH_TEXT]: richTextPropsSchema,
  [BlockType.BANNER]: bannerPropsSchema,
  [BlockType.SPACER]: spacerPropsSchema,
  [BlockType.DYNAMIC_PRODUCT_GRID]: dynamicProductGridPropsSchema,
};

const blockPropsSchemas = BlockPropsResolver;

export function parseBlockProps(type: BlockType, props: unknown): unknown {
  const schema = blockPropsSchemas[type];
  return schema.parse(props);
}

export const pageBlockDtoSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(BlockType),
  sortOrder: z.number().int(),
  visibility: z.enum(['all', 'desktop', 'mobile']),
  props: z.unknown(),
});

export const pageLayoutDtoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  blocks: z.array(pageBlockDtoSchema),
});

export type PageLayoutDto = z.infer<typeof pageLayoutDtoSchema>;
export type PageBlockDto = z.infer<typeof pageBlockDtoSchema>;

export const productDeliveryItemSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  marketplace: z.string(),
  goUrl: z.string(),
  imageUrl: z.string().url().optional(),
  price: z.object({
    amount: z.number().nullable(),
    currency: z.string(),
    isStale: z.boolean(),
    shouldShowPrice: z.boolean(),
  }),
  editorialScore: z.number(),
});

export const renderedCollectionSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  coverImageUrl: z.string(),
  ctaText: z.string(),
});

export type RenderedCollection = z.infer<typeof renderedCollectionSchema>;

export const pageBlockDeliverySchema = pageBlockDtoSchema.extend({
  renderedData: z.array(productDeliveryItemSchema).optional(),
  renderedCollection: renderedCollectionSchema.optional(),
});

export const pageLayoutDeliverySchema = pageLayoutDtoSchema.extend({
  blocks: z.array(pageBlockDeliverySchema),
});

export type ProductDeliveryItem = z.infer<typeof productDeliveryItemSchema>;
export type PageBlockDeliveryDto = z.infer<typeof pageBlockDeliverySchema>;
export type PageLayoutDeliveryDto = z.infer<typeof pageLayoutDeliverySchema>;
