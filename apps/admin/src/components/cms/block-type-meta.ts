import { BlockType } from '@ecommerce-amazon/domain';
import type { LucideIcon } from 'lucide-react';
import {
  Image,
  LayoutGrid,
  LayoutTemplate,
  Link2,
  Minus,
  Sparkles,
  SplitSquareHorizontal,
  Star,
  Tag,
  Type,
} from 'lucide-react';

import { BLOCK_TYPE_LABELS } from '@/components/cms/block-type-labels';

export type BlockTypeMeta = {
  label: string;
  icon: LucideIcon;
  accentClass: string;
};

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  [BlockType.HERO_CAROUSEL]: {
    label: BLOCK_TYPE_LABELS[BlockType.HERO_CAROUSEL],
    icon: Image,
    accentClass: 'bg-violet-100 text-violet-800',
  },
  [BlockType.FEATURED_PRODUCT]: {
    label: BLOCK_TYPE_LABELS[BlockType.FEATURED_PRODUCT],
    icon: Star,
    accentClass: 'bg-amber-100 text-amber-900',
  },
  [BlockType.PRODUCT_GRID]: {
    label: BLOCK_TYPE_LABELS[BlockType.PRODUCT_GRID],
    icon: LayoutGrid,
    accentClass: 'bg-sky-100 text-sky-900',
  },
  [BlockType.CATEGORY_PILLS]: {
    label: BLOCK_TYPE_LABELS[BlockType.CATEGORY_PILLS],
    icon: Tag,
    accentClass: 'bg-teal-100 text-teal-900',
  },
  [BlockType.HERO_SPLIT]: {
    label: BLOCK_TYPE_LABELS[BlockType.HERO_SPLIT],
    icon: SplitSquareHorizontal,
    accentClass: 'bg-indigo-100 text-indigo-900',
  },
  [BlockType.CURATED_COLLECTION]: {
    label: BLOCK_TYPE_LABELS[BlockType.CURATED_COLLECTION],
    icon: LayoutTemplate,
    accentClass: 'bg-rose-100 text-rose-900',
  },
  [BlockType.COUPON_STRIP]: {
    label: BLOCK_TYPE_LABELS[BlockType.COUPON_STRIP],
    icon: Tag,
    accentClass: 'bg-orange-100 text-orange-900',
  },
  [BlockType.RICH_TEXT]: {
    label: BLOCK_TYPE_LABELS[BlockType.RICH_TEXT],
    icon: Type,
    accentClass: 'bg-slate-100 text-slate-800',
  },
  [BlockType.BANNER]: {
    label: BLOCK_TYPE_LABELS[BlockType.BANNER],
    icon: Link2,
    accentClass: 'bg-cyan-100 text-cyan-900',
  },
  [BlockType.SPACER]: {
    label: BLOCK_TYPE_LABELS[BlockType.SPACER],
    icon: Minus,
    accentClass: 'bg-neutral-100 text-neutral-700',
  },
  [BlockType.DYNAMIC_PRODUCT_GRID]: {
    label: BLOCK_TYPE_LABELS[BlockType.DYNAMIC_PRODUCT_GRID],
    icon: Sparkles,
    accentClass: 'bg-sky-100 text-sky-900',
  },
};

export function getBlockTypeMeta(type: BlockType): BlockTypeMeta {
  return BLOCK_TYPE_META[type];
}
