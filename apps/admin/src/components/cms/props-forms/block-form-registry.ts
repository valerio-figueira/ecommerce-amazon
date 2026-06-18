import { BlockType } from '@ecommerce-amazon/domain';
import {
  bannerPropsSchema,
  bentoHubMixPropsSchema,
  categoryBentoGridPropsSchema,
  categoryPillsPropsSchema,
  curatedCollectionPropsSchema,
  dynamicProductGridPropsSchema,
  featuredProductPropsSchema,
  heroCarouselPropsSchema,
  productGridPropsSchema,
  richTextPropsSchema,
  spacerPropsSchema,
  weeklyTrendsPropsSchema,
} from '@ecommerce-amazon/shared/cms';
import type { z } from 'zod';

type SlideButtonMode = 'none' | 'link' | 'product';
type BentoTileActionMode = 'none' | 'category' | 'link';

export type HeroSlideFormValue = Record<string, unknown> & {
  buttonMode?: SlideButtonMode;
};

export type CategoryBentoTileFormValue = Record<string, unknown> & {
  actionMode?: BentoTileActionMode;
};

export type HeroCarouselFormValues = {
  slides: HeroSlideFormValue[];
  autoplay?: boolean;
  intervalMs?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function inferSlideButtonMode(slide: Record<string, unknown>): SlideButtonMode {
  if (typeof slide['linkedProductSlug'] === 'string' && slide['linkedProductSlug']) {
    return 'product';
  }
  if (
    (typeof slide['ctaHref'] === 'string' && slide['ctaHref']) ||
    (typeof slide['ctaLabel'] === 'string' && slide['ctaLabel'])
  ) {
    return 'link';
  }
  return 'none';
}

export const EDITABLE_BLOCK_SCHEMAS: Record<BlockType, z.ZodType<Record<string, unknown>> | null> = {
  [BlockType.HERO_CAROUSEL]: heroCarouselPropsSchema,
  [BlockType.FEATURED_PRODUCT]: featuredProductPropsSchema,
  [BlockType.PRODUCT_GRID]: productGridPropsSchema,
  [BlockType.CATEGORY_PILLS]: categoryPillsPropsSchema,
  [BlockType.CATEGORY_BENTO_GRID]: categoryBentoGridPropsSchema,
  [BlockType.HERO_SPLIT]: null,
  [BlockType.CURATED_COLLECTION]: curatedCollectionPropsSchema,
  [BlockType.COUPON_STRIP]: null,
  [BlockType.DYNAMIC_PRODUCT_GRID]: dynamicProductGridPropsSchema,
  [BlockType.BENTO_HUB_MIX]: bentoHubMixPropsSchema,
  [BlockType.WEEKLY_TRENDS]: weeklyTrendsPropsSchema,
  [BlockType.RICH_TEXT]: richTextPropsSchema,
  [BlockType.BANNER]: bannerPropsSchema,
  [BlockType.SPACER]: spacerPropsSchema,
};

export const PHASE2_BLOCK_TYPES: BlockType[] = [
  BlockType.HERO_SPLIT,
  BlockType.COUPON_STRIP,
];

export function isEditableBlockType(type: BlockType): boolean {
  return EDITABLE_BLOCK_SCHEMAS[type] !== null;
}

export function getSchemaForBlockType(type: BlockType): z.ZodType<Record<string, unknown>> {
  const schema = EDITABLE_BLOCK_SCHEMAS[type];
  return schema ?? spacerPropsSchema;
}

export function normalizeFormValues(type: BlockType, props: unknown): Record<string, unknown> {
  const base = isRecord(props) ? { ...props } : {};

  if (type === BlockType.HERO_CAROUSEL && Array.isArray(base['slides'])) {
    const slides = base['slides'].filter(isRecord).map((slide): HeroSlideFormValue => ({
      ...slide,
      buttonMode: inferSlideButtonMode(slide),
    }));
    return { ...base, slides };
  }

  if (type === BlockType.CATEGORY_PILLS && !Array.isArray(base['categorySlugs'])) {
    return { ...base, categorySlugs: [], mode: 'filter', showSubcategories: true };
  }

  if (type === BlockType.CATEGORY_PILLS) {
    return {
      ...base,
      mode: base['mode'] ?? 'filter',
      showSubcategories: base['showSubcategories'] ?? true,
    };
  }

  if (type === BlockType.CATEGORY_BENTO_GRID && Array.isArray(base['tiles'])) {
    const tiles = base['tiles'].filter(isRecord).map((tile): CategoryBentoTileFormValue => ({
      ...tile,
      actionMode: inferBentoTileActionMode(tile),
    }));
    return { ...base, tiles };
  }

  if (type === BlockType.CATEGORY_BENTO_GRID && !Array.isArray(base['tiles'])) {
    return { ...base, tiles: [] };
  }

  if (type === BlockType.PRODUCT_GRID && base['categorySlug'] === null) {
    return { ...base, categorySlug: undefined };
  }

  if (type === BlockType.BENTO_HUB_MIX) {
    const slot1 = isRecord(base['slot1']) ? base['slot1'] : {};
    const slot2 = isRecord(base['slot2']) ? base['slot2'] : {};
    const slot3 = isRecord(base['slot3']) ? base['slot3'] : {};
    return {
      slot1: {
        contentType: slot1['contentType'] ?? 'collection',
        entityId: slot1['entityId'] ?? '',
        ...slot1,
      },
      slot2: {
        productId: slot2['productId'] ?? '',
        ...slot2,
      },
      slot3: {
        contentType: slot3['contentType'] ?? 'category',
        categorySlug: slot3['categorySlug'] ?? '',
        productIds: Array.isArray(slot3['productIds']) ? slot3['productIds'] : [],
        ...slot3,
      },
    };
  }

  return base;
}

function sanitizeHeroSlide(slide: unknown): Record<string, unknown> {
  if (!isRecord(slide)) return {};
  const record: HeroSlideFormValue = { ...slide };
  const mode = record.buttonMode ?? inferSlideButtonMode(record);
  delete record.buttonMode;

  if (mode === 'product') {
    delete record['ctaHref'];
    if (!record['ctaLabel']) record['ctaLabel'] = 'Ver produto';
  } else if (mode === 'link') {
    delete record['linkedProductSlug'];
  } else {
    delete record['ctaLabel'];
    delete record['ctaHref'];
    delete record['linkedProductSlug'];
  }

  if (record['subtitle'] === '') delete record['subtitle'];
  if (record['ctaLabel'] === '') delete record['ctaLabel'];

  return record;
}

export function sanitizeFormValues(
  type: BlockType,
  values: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...values };

  if (next['minDiscountPercentage'] === 0 || next['minDiscountPercentage'] === undefined) {
    delete next['minDiscountPercentage'];
  }
  if (next['subtitle'] === '') {
    delete next['subtitle'];
  }
  if (next['title'] === '') {
    delete next['title'];
  }
  if (next['ctaLabel'] === '') {
    delete next['ctaLabel'];
  }

  if (type === BlockType.HERO_CAROUSEL && Array.isArray(next['slides'])) {
    next['slides'] = next['slides'].map(sanitizeHeroSlide);
  }

  if (type === BlockType.CATEGORY_PILLS) {
    if (next['linkedBlockId'] === NONE_LINKED_BLOCK || next['linkedBlockId'] === '') {
      delete next['linkedBlockId'];
    }
    if (next['title'] === '') {
      delete next['title'];
    }
  }

  if (type === BlockType.CATEGORY_BENTO_GRID && Array.isArray(next['tiles'])) {
    next['tiles'] = next['tiles'].map(sanitizeBentoTile);
  }

  if (type === BlockType.PRODUCT_GRID) {
    if (next['categorySlug'] === ALL_CATEGORY_VALUE || next['categorySlug'] === null) {
      delete next['categorySlug'];
    }
    if (next['marketplace'] === ALL_MARKETPLACE_VALUE) {
      delete next['marketplace'];
    }
  }

  if (type === BlockType.FEATURED_PRODUCT && next['ctaLabel'] === '') {
    delete next['ctaLabel'];
  }

  if (type === BlockType.BENTO_HUB_MIX) {
    sanitizeBentoHubMixValues(next);
  }

  return next;
}

function sanitizeBentoHubMixValues(values: Record<string, unknown>): void {
  const slot1 = isRecord(values['slot1']) ? { ...values['slot1'] } : null;
  if (slot1) {
    if (slot1['title'] === '') delete slot1['title'];
    if (slot1['subtitle'] === '') delete slot1['subtitle'];
    if (slot1['coverImageUrl'] === '') delete slot1['coverImageUrl'];
    values['slot1'] = slot1;
  }

  const slot3 = isRecord(values['slot3']) ? { ...values['slot3'] } : null;
  if (slot3) {
    if (slot3['listTitle'] === '') delete slot3['listTitle'];
    if (slot3['contentType'] === 'category') {
      delete slot3['productIds'];
    } else if (slot3['contentType'] === 'products') {
      delete slot3['categorySlug'];
      delete slot3['listTitle'];
    }
    values['slot3'] = slot3;
  }
}

export const INTERVAL_MS_OPTIONS = [
  { value: 4000, label: 'Rápido (4 segundos)' },
  { value: 6000, label: 'Normal (6 segundos)' },
  { value: 8000, label: 'Lento (8 segundos)' },
] as const;

export const PRODUCT_GRID_PAGE_SIZE_PRESETS = [8, 12, 16, 24] as const;

export const NONE_LINKED_BLOCK = '__none__';
export const ALL_CATEGORY_VALUE = '__all__';
export const ALL_MARKETPLACE_VALUE = '__all__';

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function readUnknownArrayItem(source: unknown, index: number): unknown {
  if (!isUnknownArray(source) || index < 0 || index >= source.length) {
    return undefined;
  }
  return source[index];
}

export function getSlideButtonMode(slide: unknown): SlideButtonMode {
  if (!isRecord(slide)) return 'none';
  if (typeof slide['buttonMode'] === 'string') {
    if (slide['buttonMode'] === 'link' || slide['buttonMode'] === 'product') {
      return slide['buttonMode'];
    }
  }
  return inferSlideButtonMode(slide);
}

export function getBentoTileActionMode(tile: unknown): BentoTileActionMode {
  if (!isRecord(tile)) return 'none';
  if (typeof tile['actionMode'] === 'string') {
    if (tile['actionMode'] === 'link' || tile['actionMode'] === 'category') {
      return tile['actionMode'];
    }
  }
  return inferBentoTileActionMode(tile);
}

function inferBentoTileActionMode(tile: Record<string, unknown>): BentoTileActionMode {
  if (typeof tile['href'] === 'string' && tile['href']) {
    return 'link';
  }
  if (typeof tile['categorySlug'] === 'string' && tile['categorySlug']) {
    return 'category';
  }
  return 'none';
}

function sanitizeBentoTile(tile: unknown): Record<string, unknown> {
  if (!isRecord(tile)) return {};
  const record: CategoryBentoTileFormValue = { ...tile };
  const mode = record.actionMode ?? inferBentoTileActionMode(record);
  delete record.actionMode;

  if (mode === 'link') {
    delete record['categorySlug'];
  } else if (mode === 'category') {
    delete record['href'];
    if (record['categorySlug'] === ALL_CATEGORY_VALUE || record['categorySlug'] === '') {
      delete record['categorySlug'];
    }
  } else {
    delete record['href'];
    delete record['categorySlug'];
  }

  if (record['subtitle'] === '') delete record['subtitle'];

  return record;
}
