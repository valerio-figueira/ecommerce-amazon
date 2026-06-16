import type { ComponentType } from 'react';

import { BlockType } from '@ecommerce-amazon/domain';
import type { PageBlockDeliveryDto } from '@ecommerce-amazon/shared/cms';

import { BannerBlock } from '@/components/blocks/BannerBlock';
import { BentoHubMixBlock } from '@/components/blocks/BentoHubMixBlock';
import { CategoryBentoGridBlock } from '@/components/blocks/CategoryBentoGridBlock';
import { CategoryPillsBlock } from '@/components/blocks/CategoryPillsBlock';
import { CouponStripBlock } from '@/components/blocks/CouponStripBlock';
import { CuratedCollectionBlock } from '@/components/blocks/CuratedCollectionBlock';
import { DynamicProductGridBlock } from '@/components/blocks/DynamicProductGridBlock';
import { FeaturedProductBlock } from '@/components/blocks/FeaturedProductBlock';
import { HeroCarouselBlock } from '@/components/blocks/HeroCarouselBlock';
import { HeroSplitBlock } from '@/components/blocks/HeroSplitBlock';
import { ProductGridBlock } from '@/components/blocks/ProductGridBlock';
import { RichTextBlock } from '@/components/blocks/RichTextBlock';
import { SpacerBlock } from '@/components/blocks/SpacerBlock';

export type BlockComponentProps = {
  block: PageBlockDeliveryDto;
  blocksById: Record<string, PageBlockDeliveryDto>;
  isFirstBlock?: boolean;
};

export const BlockRegistry: Record<
  BlockType,
  ComponentType<BlockComponentProps> | undefined
> = {
  [BlockType.HERO_CAROUSEL]: HeroCarouselBlock,
  [BlockType.FEATURED_PRODUCT]: FeaturedProductBlock,
  [BlockType.PRODUCT_GRID]: ProductGridBlock,
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
};
