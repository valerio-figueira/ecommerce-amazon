import { BlockType, ProductSortField, type CacheStore, type PageBlock, type PageRepository } from '@ecommerce-amazon/domain';
import {
  dynamicProductGridPropsSchema,
  parseBlockProps,
  type PageBlockDeliveryDto,
  type PageLayoutDeliveryDto,
} from '@ecommerce-amazon/shared/cms';

import { toProductDeliveryItem } from '../../mappers/product-delivery.mapper.js';
import type { ListProducts } from '../product/ListProducts.js';

function toBlockDto(block: PageBlock): PageBlockDeliveryDto {
  return {
    id: block.id,
    type: block.type,
    sortOrder: block.sortOrder,
    visibility: block.visibility,
    props: parseBlockProps(block.type, block.props),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPageLayoutDeliveryDto(value: unknown): value is PageLayoutDeliveryDto {
  return isRecord(value) && typeof value['slug'] === 'string' && Array.isArray(value['blocks']);
}

function stripRenderedData(layout: PageLayoutDeliveryDto): PageLayoutDeliveryDto {
  return {
    ...layout,
    blocks: layout.blocks.map(({ renderedData: _renderedData, ...block }) => block),
  };
}

function mapDynamicGridSortBy(
  sortBy: 'editorial_score' | 'created_at' | 'price_asc' | 'price_desc',
): ProductSortField {
  switch (sortBy) {
    case 'created_at':
      return ProductSortField.CREATED_AT;
    case 'price_asc':
      return ProductSortField.PRICE_ASC;
    case 'price_desc':
      return ProductSortField.PRICE_DESC;
    case 'editorial_score':
    default:
      return ProductSortField.EDITORIAL_SCORE;
  }
}

export type GetPublishedPageLayoutResult = PageLayoutDeliveryDto;

export class GetPublishedPageLayout {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly cache: CacheStore,
    private readonly listProducts: ListProducts,
  ) {}

  async execute(slug: string): Promise<GetPublishedPageLayoutResult | null> {
    const cacheKey = `vitrine:page:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);

    let baseLayout: PageLayoutDeliveryDto;

    if (isPageLayoutDeliveryDto(cached)) {
      baseLayout = stripRenderedData(cached);
    } else {
      const result = await this.pageRepository.findPublishedBySlug(slug);
      if (!result) return null;

      baseLayout = {
        slug: result.layout.slug,
        title: result.layout.title,
        ...(result.layout.seoTitle !== undefined ? { seoTitle: result.layout.seoTitle } : {}),
        ...(result.layout.seoDescription !== undefined
          ? { seoDescription: result.layout.seoDescription }
          : {}),
        blocks: result.blocks.map(toBlockDto),
      };

      await this.cache.set(cacheKey, stripRenderedData(baseLayout), 300);
    }

    return this.hydrateDynamicBlocks(baseLayout);
  }

  private async hydrateDynamicBlocks(
    layout: PageLayoutDeliveryDto,
  ): Promise<PageLayoutDeliveryDto> {
    const hydratedBlocks = await Promise.all(
      layout.blocks.map(async (block) => this.hydrateBlock(block)),
    );

    return { ...layout, blocks: hydratedBlocks };
  }

  private async hydrateBlock(block: PageBlockDeliveryDto): Promise<PageBlockDeliveryDto> {
    if (block.type !== BlockType.DYNAMIC_PRODUCT_GRID) {
      return block;
    }

    const props = dynamicProductGridPropsSchema.parse(block.props);
    const listFilters: {
      page: number;
      pageSize: number;
      sort: ProductSortField;
      category?: string;
      minDiscountPercentage?: number;
    } = {
      page: 1,
      pageSize: props.limit,
      sort: mapDynamicGridSortBy(props.sortBy),
    };

    if (props.categoryVertical !== undefined) {
      listFilters.category = props.categoryVertical;
    }
    if (props.minDiscountPercentage !== undefined) {
      listFilters.minDiscountPercentage = props.minDiscountPercentage;
    }

    const { items } = await this.listProducts.execute(listFilters);

    return {
      ...block,
      renderedData: items.map(toProductDeliveryItem),
    };
  }
}
