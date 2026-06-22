import {
  BlockType,
  ProductSortField,
  type CacheStore,
  type CategoryRepository,
  type ContentRepository,
  type CuratedCollectionRepository,
  type PageBlock,
  type PageRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import {
  bentoHubMixPropsSchema,
  curatedCollectionPropsSchema,
  dynamicProductGridPropsSchema,
  parseBlockProps,
  weeklyTrendsPropsSchema,
  type BentoHubMixRendered,
  type BentoHubMixRenderedSlot1,
  type BentoHubMixSlot1Props,
  type BentoHubMixSlot3Props,
  type PageBlockDeliveryDto,
  type PageLayoutDeliveryDto,
  type ProductDeliveryItem,
} from '@ecommerce-amazon/shared/cms';

import { toProductDeliveryItem } from '../../mappers/product-delivery.mapper.js';
import {
  applyPriceComplianceToProduct,
  applyPriceComplianceToProducts,
} from '../../services/apply-price-compliance.js';
import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import type { GetCuratedCollection } from '../content/GetCuratedCollection.js';
import type { ListProducts } from '../product/ListProducts.js';
import type { GetWeeklyTrends } from '../trends/GetWeeklyTrends.js';

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
    blocks: layout.blocks.map(
      ({
        renderedData: _renderedData,
        renderedCollection: _renderedCollection,
        renderedCollections: _renderedCollections,
        renderedBentoHubMix: _renderedBentoHubMix,
        renderedWeeklyTrends: _renderedWeeklyTrends,
        ...block
      }) => block,
    ),
  };
}

function mapDynamicGridSortBy(
  sortBy: 'editorial_score' | 'created_at' | 'price_asc' | 'price_desc' | 'discount_percent_desc',
): ProductSortField {
  switch (sortBy) {
    case 'created_at':
      return ProductSortField.CREATED_AT;
    case 'price_asc':
      return ProductSortField.PRICE_ASC;
    case 'price_desc':
      return ProductSortField.PRICE_DESC;
    case 'discount_percent_desc':
      return ProductSortField.DISCOUNT_PERCENT_DESC;
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
    private readonly getCuratedCollection: GetCuratedCollection,
    private readonly curatedCollectionRepository: CuratedCollectionRepository,
    private readonly contentRepository: ContentRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly getWeeklyTrends: GetWeeklyTrends,
    private readonly gateService: AffiliateScaleGateService,
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
    const pricesEnabled = await this.gateService.isPricesEnabled();
    const priceOptions = { pricesEnabled };

    const hydratedBlocks = await Promise.all(
      layout.blocks.map(async (block) => this.hydrateBlock(block, priceOptions)),
    );

    return { ...layout, blocks: hydratedBlocks };
  }

  private async hydrateBlock(
    block: PageBlockDeliveryDto,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<PageBlockDeliveryDto> {
    if (block.type === BlockType.CURATED_COLLECTION) {
      return this.hydrateCuratedCollectionBlock(block, priceOptions);
    }

    if (block.type === BlockType.DYNAMIC_PRODUCT_GRID) {
      return this.hydrateDynamicProductGridBlock(block, priceOptions);
    }

    if (block.type === BlockType.BENTO_HUB_MIX) {
      return this.hydrateBentoHubMixBlock(block, priceOptions);
    }

    if (block.type === BlockType.WEEKLY_TRENDS) {
      return this.hydrateWeeklyTrendsBlock(block, priceOptions);
    }

    return block;
  }

  private async hydrateWeeklyTrendsBlock(
    block: PageBlockDeliveryDto,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<PageBlockDeliveryDto> {
    const props = weeklyTrendsPropsSchema.parse(block.props);
    const rendered = await this.getWeeklyTrends.execute(props, priceOptions);

    if (!rendered) {
      return block;
    }

    return {
      ...block,
      renderedWeeklyTrends: rendered,
    };
  }

  private async hydrateCuratedCollectionBlock(
    block: PageBlockDeliveryDto,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<PageBlockDeliveryDto> {
    const props = curatedCollectionPropsSchema.parse(block.props);
    const slides = (
      await Promise.all(
        props.collectionSlugs.map(async (slug) => {
          const result = await this.getCuratedCollection.execute(slug);
          if (!result) {
            return null;
          }

          return {
            collection: {
              id: result.collection.id,
              slug: result.collection.slug,
              title: result.collection.title,
              description: result.collection.description,
              coverImageUrl: result.collection.coverImageUrl,
              ctaText: result.collection.ctaText,
              utmDefaults: result.collection.utmDefaults,
            },
            products: result.products.map((product) =>
              toProductDeliveryItem(product, priceOptions),
            ),
          };
        }),
      )
    ).filter((slide): slide is NonNullable<typeof slide> => slide !== null);

    if (slides.length === 0) {
      return block;
    }

    return {
      ...block,
      renderedCollections: slides,
    };
  }

  private async hydrateDynamicProductGridBlock(
    block: PageBlockDeliveryDto,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<PageBlockDeliveryDto> {
    const props = dynamicProductGridPropsSchema.parse(block.props);
    const listFilters: {
      page: number;
      pageSize: number;
      sort: ProductSortField;
      category?: string;
      minDiscountPercentage?: number;
      visibleOnly?: boolean;
      freshPriceOnly?: boolean;
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
      listFilters.freshPriceOnly = true;
    }
    listFilters.visibleOnly = true;

    const { items } = await this.listProducts.execute(listFilters);

    return {
      ...block,
      renderedData: items
        .filter((product) => product.shouldShowPrice)
        .map((product) => toProductDeliveryItem(product, priceOptions)),
    };
  }

  private async hydrateBentoHubMixBlock(
    block: PageBlockDeliveryDto,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<PageBlockDeliveryDto> {
    const props = bentoHubMixPropsSchema.parse(block.props);

    const [slot1, slot2, slot3] = await Promise.all([
      this.resolveBentoSlot1(props.slot1),
      this.resolveBentoSlot2(props.slot2.productId, priceOptions),
      this.resolveBentoSlot3(props.slot3, priceOptions),
    ]);

    const renderedBentoHubMix: BentoHubMixRendered = { slot1, slot2, slot3 };

    return {
      ...block,
      renderedBentoHubMix,
    };
  }

  private async resolveBentoSlot1(
    slot: BentoHubMixSlot1Props,
  ): Promise<BentoHubMixRenderedSlot1 | null> {
    if (slot.contentType === 'collection') {
      const collection = await this.curatedCollectionRepository.findById(slot.entityId);
      if (!collection) return null;

      const coverImageUrl = slot.coverImageUrl ?? collection.coverImageUrl;
      return {
        href: `/colecoes/${collection.slug}`,
        title: slot.title ?? collection.title,
        ...(slot.subtitle !== undefined ? { subtitle: slot.subtitle } : {}),
        coverImageUrl,
        contentType: 'collection',
      };
    }

    const article = await this.contentRepository.findArticleById(slot.entityId);
    if (!article) return null;

    const coverImageUrl = slot.coverImageUrl ?? article.coverImageUrl;
    if (!coverImageUrl) return null;

    return {
      href: `/artigos/${article.slug}`,
      title: slot.title ?? article.title,
      ...(slot.subtitle !== undefined ? { subtitle: slot.subtitle } : {}),
      coverImageUrl,
      contentType: 'article',
    };
  }

  private async resolveBentoSlot2(
    productId: string,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<ProductDeliveryItem | null> {
    const product = await this.productRepository.findById(productId);
    if (!product) return null;
    applyPriceComplianceToProduct(product);
    return toProductDeliveryItem(product, priceOptions);
  }

  private async resolveBentoSlot3(
    slot: BentoHubMixSlot3Props,
    priceOptions: { pricesEnabled: boolean },
  ): Promise<BentoHubMixRendered['slot3']> {
    if (slot.contentType === 'category') {
      const category = await this.categoryRepository.findBySlug(slot.categorySlug);
      const { items } = await this.listProducts.execute({
        page: 1,
        pageSize: 3,
        category: slot.categorySlug,
        sort: ProductSortField.EDITORIAL_SCORE,
        visibleOnly: true,
      });

      const products = items
        .map((product) => toProductDeliveryItem(product, priceOptions))
        .slice(0, 3);

      return {
        mode: 'category',
        categoryHref: `/categorias/${slot.categorySlug}`,
        categoryTitle: slot.listTitle ?? category?.label,
        products,
      };
    }

    const productsById = await this.productRepository.findByIds(slot.productIds);
    const byId = new Map<string, (typeof productsById)[number]>(
      productsById.map((product) => [product.id, product]),
    );
    const manualProducts = slot.productIds
      .map((id) => byId.get(id))
      .filter((product): product is NonNullable<typeof product> => product !== undefined);
    applyPriceComplianceToProducts(manualProducts);
    const products = manualProducts
      .map((product) => toProductDeliveryItem(product, priceOptions))
      .slice(0, 3);

    return {
      mode: 'products',
      products,
    };
  }
}
