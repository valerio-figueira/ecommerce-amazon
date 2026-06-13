import { BlockType } from '@ecommerce-amazon/domain';
import {
  bannerPropsSchema,
  categoryPillsPropsSchema,
  categoryBentoGridPropsSchema,
  curatedCollectionPropsSchema,
  dynamicProductGridPropsSchema,
  featuredProductPropsSchema,
  heroCarouselPropsSchema,
  productGridPropsSchema,
  richTextPropsSchema,
  spacerPropsSchema,
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
  [BlockType.DYNAMIC_PRODUCT_GRID]: 'Grade Dinâmica',
};

export const EDITABLE_BLOCK_TYPES: BlockType[] = [
  BlockType.HERO_CAROUSEL,
  BlockType.FEATURED_PRODUCT,
  BlockType.PRODUCT_GRID,
  BlockType.CATEGORY_PILLS,
  BlockType.CATEGORY_BENTO_GRID,
  BlockType.DYNAMIC_PRODUCT_GRID,
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
  BlockType.CATEGORY_PILLS,
  BlockType.PRODUCT_GRID,
  BlockType.DYNAMIC_PRODUCT_GRID,
  BlockType.CURATED_COLLECTION,
  BlockType.COUPON_STRIP,
  BlockType.BANNER,
  BlockType.RICH_TEXT,
  BlockType.SPACER,
];

/** @deprecated Prefer ADDABLE_BLOCK_TYPES */
export const ALL_BLOCK_TYPES: BlockType[] = ADDABLE_BLOCK_TYPES;

export function getBlockDisplayTitle(type: BlockType, props: unknown): string {
  if (typeof props === 'object' && props !== null && 'title' in props) {
    const titleValue = Reflect.get(props, 'title');
    if (typeof titleValue === 'string' && titleValue.trim().length > 0) {
      return titleValue;
    }
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
        title: 'Novo bloco editorial',
      });
    case BlockType.CURATED_COLLECTION:
      return curatedCollectionPropsSchema.parse({
        collectionSlug: 'setup-gamer-iniciante',
        layout: 'grid',
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
    default:
      return {};
  }
}
