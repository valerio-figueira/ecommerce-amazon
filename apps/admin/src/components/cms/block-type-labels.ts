import { BlockType } from '@ecommerce-amazon/domain';
import {
  bannerPropsSchema,
  bentoHubMixPropsSchema,
  categoryPillsPropsSchema,
  categoryBentoGridPropsSchema,
  curatedCollectionPropsSchema,
  dynamicProductGridPropsSchema,
  featuredProductPropsSchema,
  heroCarouselPropsSchema,
  productGridPropsSchema,
  richTextPropsSchema,
  spacerPropsSchema,
  weeklyTrendsPropsSchema,
} from '@ecommerce-amazon/shared/cms';

import { isEditableBlockType } from '@/components/cms/props-forms/block-form-registry';

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  [BlockType.HERO_CAROUSEL]: 'Hero Carousel',
  [BlockType.FEATURED_PRODUCT]: 'Produto em Destaque',
  [BlockType.PRODUCT_GRID]: 'Grade de Produtos',
  [BlockType.CATEGORY_PILLS]: 'Pills de Categorias',
  [BlockType.CATEGORY_BENTO_GRID]: 'Grade Bento de Categorias',
  [BlockType.HERO_SPLIT]: 'Hero Split',
  [BlockType.CURATED_COLLECTION]: 'Coleção Curada',
  [BlockType.COUPON_STRIP]: 'Faixa de Cupons',
  [BlockType.RICH_TEXT]: 'Texto Rico',
  [BlockType.BANNER]: 'Banner',
  [BlockType.SPACER]: 'Espaçador',
  [BlockType.DYNAMIC_PRODUCT_GRID]: 'Ofertas Relâmpago',
  [BlockType.BENTO_HUB_MIX]: 'Hub Bento Mix',
  [BlockType.WEEKLY_TRENDS]: 'Tendências da semana',
};

export const EDITABLE_BLOCK_TYPES: BlockType[] = [
  BlockType.HERO_CAROUSEL,
  BlockType.FEATURED_PRODUCT,
  BlockType.PRODUCT_GRID,
  BlockType.CATEGORY_PILLS,
  BlockType.CATEGORY_BENTO_GRID,
  BlockType.DYNAMIC_PRODUCT_GRID,
  BlockType.WEEKLY_TRENDS,
  BlockType.BENTO_HUB_MIX,
  BlockType.CURATED_COLLECTION,
  BlockType.RICH_TEXT,
  BlockType.BANNER,
  BlockType.SPACER,
];

export { isEditableBlockType };

/** Explicit list — do not use Object.values(BlockType); stale domain builds omit new enum members at runtime. */
export const ADDABLE_BLOCK_TYPES: BlockType[] = [
  BlockType.HERO_CAROUSEL,
  BlockType.HERO_SPLIT,
  BlockType.FEATURED_PRODUCT,
  BlockType.CATEGORY_BENTO_GRID,
  BlockType.BENTO_HUB_MIX,
  BlockType.CATEGORY_PILLS,
  BlockType.PRODUCT_GRID,
  BlockType.DYNAMIC_PRODUCT_GRID,
  BlockType.WEEKLY_TRENDS,
  BlockType.CURATED_COLLECTION,
  BlockType.COUPON_STRIP,
  BlockType.BANNER,
  BlockType.RICH_TEXT,
  BlockType.SPACER,
];

/** @deprecated Prefer ADDABLE_BLOCK_TYPES */
export const ALL_BLOCK_TYPES: BlockType[] = ADDABLE_BLOCK_TYPES;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getBlockDisplayTitle(type: BlockType, props: unknown): string {
  if (type === BlockType.BENTO_HUB_MIX && isRecord(props)) {
    const slot1 = props['slot1'];
    if (isRecord(slot1) && typeof slot1['title'] === 'string' && slot1['title'].trim().length > 0) {
      return slot1['title'];
    }
  }
  if (isRecord(props) && typeof props['title'] === 'string' && props['title'].trim().length > 0) {
    return props['title'];
  }
  return BLOCK_TYPE_LABELS[type];
}

export function getDefaultBlockProps(type: BlockType): unknown {
  switch (type) {
    case BlockType.HERO_CAROUSEL:
      return heroCarouselPropsSchema.parse({
        slides: [
          {
            imageUrl: 'https://placehold.co/1200x800?text=Slide',
            title: 'Novo slide',
          },
        ],
      });
    case BlockType.FEATURED_PRODUCT:
      return featuredProductPropsSchema.parse({
        productSlug: 'cadeira-ergonomica-home-office',
        showMarketplaceBadge: true,
      });
    case BlockType.PRODUCT_GRID:
      return productGridPropsSchema.parse({
        title: 'Produtos populares',
      });
    case BlockType.CATEGORY_PILLS:
      return categoryPillsPropsSchema.parse({
        categorySlugs: ['home-office'],
      });
    case BlockType.CATEGORY_BENTO_GRID:
      return categoryBentoGridPropsSchema.parse({
        title: 'Categorias populares',
        tiles: [
          {
            title: 'Home office',
            subtitle: 'Curadoria ergonômica',
            imageUrl: 'https://placehold.co/400x400?text=Office',
            size: 'large',
            categorySlug: 'home-office',
          },
          {
            title: 'Games',
            subtitle: 'Setup gamer',
            imageUrl: 'https://placehold.co/300x300?text=Games',
            size: 'small',
            categorySlug: 'games',
          },
          {
            title: 'Eletrônicos',
            subtitle: 'Tech selecionada',
            imageUrl: 'https://placehold.co/300x300?text=Tech',
            size: 'small',
            categorySlug: 'eletronicos',
          },
        ],
      });
    case BlockType.DYNAMIC_PRODUCT_GRID:
      return dynamicProductGridPropsSchema.parse({
        title: 'Ofertas Relâmpago',
        subtitle: 'Maiores descontos detectados nas últimas horas',
        minDiscountPercentage: 30,
        sortBy: 'discount_percent_desc',
        limit: 12,
      });
    case BlockType.CURATED_COLLECTION:
      return curatedCollectionPropsSchema.parse({
        collectionSlugs: ['setup-gamer-iniciante', 'home-office-essencial', 'perifericos-premium'],
        autoplay: true,
        intervalMs: 8000,
      });
    case BlockType.SPACER:
      return spacerPropsSchema.parse({});
    case BlockType.BANNER:
      return bannerPropsSchema.parse({
        imageUrl: 'https://placehold.co/1200x600?text=Banner',
        href: 'https://example.com',
        alt: 'Banner promocional',
      });
    case BlockType.RICH_TEXT:
      return richTextPropsSchema.parse({
        html: '<p>Conteúdo editorial</p>',
      });
    case BlockType.BENTO_HUB_MIX:
      return bentoHubMixPropsSchema.parse({
        slot1: {
          contentType: 'collection',
          entityId: '00000000-0000-4000-8000-000000000001',
          title: 'Destaque editorial',
          subtitle: 'Coleção ou artigo em evidência',
        },
        slot2: {
          productId: '00000000-0000-4000-8000-000000000002',
        },
        slot3: {
          contentType: 'category',
          categorySlug: 'games',
          listTitle: 'Top Games',
        },
      });
    case BlockType.WEEKLY_TRENDS:
      return weeklyTrendsPropsSchema.parse({});
    default:
      return {};
  }
}
