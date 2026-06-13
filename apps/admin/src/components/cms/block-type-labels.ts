import { BlockType } from '@ecommerce-amazon/domain';
import {
  bannerPropsSchema,
  BlockPropsResolver,
  dynamicProductGridPropsSchema,
  richTextPropsSchema,
  spacerPropsSchema,
} from '@ecommerce-amazon/shared/cms';

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  [BlockType.HERO_CAROUSEL]: 'Hero Carousel',
  [BlockType.FEATURED_PRODUCT]: 'Produto em Destaque',
  [BlockType.PRODUCT_GRID]: 'Grade de Produtos',
  [BlockType.CATEGORY_PILLS]: 'Pills de Categorias',
  [BlockType.HERO_SPLIT]: 'Hero Split',
  [BlockType.CURATED_COLLECTION]: 'Coleção Curada',
  [BlockType.COUPON_STRIP]: 'Faixa de Cupons',
  [BlockType.RICH_TEXT]: 'Texto Rico',
  [BlockType.BANNER]: 'Banner',
  [BlockType.SPACER]: 'Espaçador',
  [BlockType.DYNAMIC_PRODUCT_GRID]: 'Grade Dinâmica',
};

export const EDITABLE_BLOCK_TYPES: BlockType[] = [
  BlockType.DYNAMIC_PRODUCT_GRID,
  BlockType.SPACER,
  BlockType.BANNER,
  BlockType.RICH_TEXT,
];

export const ALL_BLOCK_TYPES: BlockType[] = Object.values(BlockType);

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
    case BlockType.DYNAMIC_PRODUCT_GRID:
      return dynamicProductGridPropsSchema.parse({
        title: 'Novo bloco editorial',
      });
    case BlockType.SPACER:
      return spacerPropsSchema.parse({});
    case BlockType.BANNER:
      return bannerPropsSchema.parse({
        imageUrl: 'https://example.com/banner.jpg',
        href: 'https://example.com',
        alt: 'Banner',
      });
    case BlockType.RICH_TEXT:
      return richTextPropsSchema.parse({
        html: '<p>Conteúdo editorial</p>',
      });
    default:
      try {
        const schema = BlockPropsResolver[type];
        if ('parse' in schema && typeof schema.parse === 'function') {
          return schema.parse({});
        }
      } catch {
        return {};
      }
      return {};
  }
}
