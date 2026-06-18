import type { ComponentType, ReactElement } from 'react';

import { BlockType } from '@ecommerce-amazon/domain';
import type { PageBlockDeliveryDto } from '@ecommerce-amazon/shared/cms';

import { BannerBlock } from '@/components/blocks/BannerBlock';
import { BentoHubMixBlock } from '@/components/blocks/BentoHubMixBlock';
import { CategoryBentoGridBlock } from '@/components/blocks/CategoryBentoGridBlock';
import { CategoryPillsBlock } from '@/components/blocks/CategoryPillsBlock';
import { CouponStripBlock } from '@/components/blocks/CouponStripBlock';
import { CuratedCollectionBlock } from '@/components/blocks/CuratedCollectionBlock';
import { DynamicProductGridBlock } from '@/components/blocks/DynamicProductGridBlock';
import { FeaturedProductBlockServer } from '@/components/blocks/FeaturedProductBlockServer';
import { HeroCarouselBlock } from '@/components/blocks/HeroCarouselBlock';
import { HeroSplitBlock } from '@/components/blocks/HeroSplitBlock';
import { ProductGridBlockServer } from '@/components/blocks/ProductGridBlockServer';
import { RichTextBlock } from '@/components/blocks/RichTextBlock';
import { SpacerBlock } from '@/components/blocks/SpacerBlock';
import { WeeklyTrendsBlock } from '@/components/blocks/WeeklyTrendsBlock';

export type BlockComponentProps = {
  block: PageBlockDeliveryDto;
  blocksById: Record<string, PageBlockDeliveryDto>;
  isFirstBlock?: boolean;
};

export const BlockRegistry: Record<
  BlockType,
  | ComponentType<BlockComponentProps>
  | ((props: BlockComponentProps) => Promise<ReactElement>)
  | undefined
> = {
  [BlockType.HERO_CAROUSEL]: HeroCarouselBlock,
  [BlockType.FEATURED_PRODUCT]: FeaturedProductBlockServer,
  [BlockType.PRODUCT_GRID]: ProductGridBlockServer,
  [BlockType.CATEGORY_PILLS]: CategoryPillsBlock,
  [BlockType.CATEGORY_BENTO_GRID]: CategoryBentoGridBlock,
  [BlockType.HERO_SPLIT]: HeroSplitBlock,
  [BlockType.CURATED_COLLECTION]: CuratedCollectionBlock,
  [BlockType.COUPON_STRIP]: CouponStripBlock,
  [BlockType.RICH_TEXT]: RichTextBlock,
  [BlockType.BANNER]: BannerBlock,
  [BlockType.SPACER]: SpacerBlock,
  [BlockType.DYNAMIC_PRODUCT_GRID]: DynamicProductGridBlock,
  [BlockType.BENTO_HUB_MIX]: BentoHubMixBlock,
  [BlockType.WEEKLY_TRENDS]: WeeklyTrendsBlock,
};
