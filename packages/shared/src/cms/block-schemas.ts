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
  marketplace: z.enum(['amazon_br', 'shopee_br']).optional(),
  sort: z.enum(['editorial_score', 'price_updated_at']).default('editorial_score'),
  pageSize: z.number().int().min(4).max(24).default(12),
  columns: z.union([z.literal(2), z.literal(4)]).default(4),
});

export const categoryPillsPropsSchema = z.object({
  title: z.string().optional(),
  categorySlugs: z.array(z.string()).min(1),
  linkedBlockId: z.string().uuid().optional(),
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
  marketplace: z.enum(['amazon_br', 'shopee_br']).optional(),
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

export type HeroCarouselProps = z.infer<typeof heroCarouselPropsSchema>;
export type FeaturedProductProps = z.infer<typeof featuredProductPropsSchema>;
export type ProductGridProps = z.infer<typeof productGridPropsSchema>;
export type CategoryPillsProps = z.infer<typeof categoryPillsPropsSchema>;
export type HeroSplitProps = z.infer<typeof heroSplitPropsSchema>;
export type CuratedCollectionProps = z.infer<typeof curatedCollectionPropsSchema>;
export type CouponStripProps = z.infer<typeof couponStripPropsSchema>;
export type RichTextProps = z.infer<typeof richTextPropsSchema>;
export type BannerProps = z.infer<typeof bannerPropsSchema>;
export type SpacerProps = z.infer<typeof spacerPropsSchema>;

export type BlockPropsMap = {
  [BlockType.HERO_CAROUSEL]: HeroCarouselProps;
  [BlockType.FEATURED_PRODUCT]: FeaturedProductProps;
  [BlockType.PRODUCT_GRID]: ProductGridProps;
  [BlockType.CATEGORY_PILLS]: CategoryPillsProps;
  [BlockType.HERO_SPLIT]: HeroSplitProps;
  [BlockType.CURATED_COLLECTION]: CuratedCollectionProps;
  [BlockType.COUPON_STRIP]: CouponStripProps;
  [BlockType.RICH_TEXT]: RichTextProps;
  [BlockType.BANNER]: BannerProps;
  [BlockType.SPACER]: SpacerProps;
};

const blockPropsSchemas: Record<BlockType, z.ZodType<unknown>> = {
  [BlockType.HERO_CAROUSEL]: heroCarouselPropsSchema,
  [BlockType.FEATURED_PRODUCT]: featuredProductPropsSchema,
  [BlockType.PRODUCT_GRID]: productGridPropsSchema,
  [BlockType.CATEGORY_PILLS]: categoryPillsPropsSchema,
  [BlockType.HERO_SPLIT]: heroSplitPropsSchema,
  [BlockType.CURATED_COLLECTION]: curatedCollectionPropsSchema,
  [BlockType.COUPON_STRIP]: couponStripPropsSchema,
  [BlockType.RICH_TEXT]: richTextPropsSchema,
  [BlockType.BANNER]: bannerPropsSchema,
  [BlockType.SPACER]: spacerPropsSchema,
};

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
