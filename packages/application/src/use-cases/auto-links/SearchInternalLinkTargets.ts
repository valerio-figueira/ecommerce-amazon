import {
  type ArticleCategoryRepository,
  type CategoryRepository,
  type ContentRepository,
  type CuratedCollectionRepository,
  type ProductRepository,
} from '@ecommerce-amazon/domain';
import {
  buildInternalLinkTargetUrl,
  INTERNAL_LINK_TARGET_MIN_SEARCH_LENGTH,
  parseInternalLinkTargetUrl,
  type InternalLinkTargetDto,
  type InternalLinkTargetType,
  type SearchInternalLinkTargetsQuery,
  type SearchInternalLinkTargetsResponse,
} from '@ecommerce-amazon/shared/admin';

const COLLECTION_LIMIT = 10;
const ARTICLE_LIMIT = 10;
const TAXONOMY_LIMIT = 15;

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

function toDto(
  type: InternalLinkTargetType,
  slug: string,
  label: string,
  meta?: string,
): InternalLinkTargetDto {
  return {
    type,
    slug,
    label,
    targetUrl: buildInternalLinkTargetUrl(type, slug),
    ...(meta !== undefined ? { meta } : {}),
  };
}

function matchesSearch(values: string[], search: string): boolean {
  const normalized = search.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return values.some((value) => value.toLowerCase().includes(normalized));
}

function dedupeTargets(items: InternalLinkTargetDto[]): InternalLinkTargetDto[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.targetUrl)) {
      return false;
    }
    seen.add(item.targetUrl);
    return true;
  });
}

export class SearchInternalLinkTargets {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly collectionRepository: CuratedCollectionRepository,
    private readonly contentRepository: ContentRepository,
    private readonly articleCategoryRepository: ArticleCategoryRepository,
  ) {}

  async execute(query: SearchInternalLinkTargetsQuery): Promise<SearchInternalLinkTargetsResponse> {
    const search = query.search?.trim() ?? '';
    const productLimit = query.productLimit ?? 20;
    const items: InternalLinkTargetDto[] = [];

    if (query.selectedUrl) {
      const resolved = await this.resolveTargetUrl(query.selectedUrl);
      if (resolved) {
        items.push(resolved);
      }
    }

    const categories = (await this.categoryRepository.listAll())
      .filter((category) => category.visible)
      .filter((category) => matchesSearch([category.label, category.slug], search))
      .slice(0, search.length > 0 ? TAXONOMY_LIMIT : undefined)
      .map((category) => toDto('product_category', category.slug, category.label));

    const articleCategories = (await this.articleCategoryRepository.listAll())
      .filter((category) => matchesSearch([category.name, category.slug], search))
      .slice(0, search.length > 0 ? TAXONOMY_LIMIT : undefined)
      .map((category) => toDto('article_category', category.slug, category.name));

    const collections = (await this.collectionRepository.listAll())
      .filter((collection) => matchesSearch([collection.title, collection.slug], search))
      .slice(0, search.length > 0 ? COLLECTION_LIMIT : undefined)
      .map((collection) => toDto('collection', collection.slug, collection.title));

    items.push(...categories, ...articleCategories, ...collections);

    if (search.length >= INTERNAL_LINK_TARGET_MIN_SEARCH_LENGTH) {
      const [products, articles] = await Promise.all([
        this.productRepository.findPublished({
          search,
          page: 1,
          pageSize: productLimit,
        }),
        this.contentRepository.listPublishedArticles({
          search,
          page: 1,
          limit: ARTICLE_LIMIT,
        }),
      ]);

      items.push(
        ...products.items.map((product) =>
          toDto(
            'product',
            String(product.slug),
            product.titleClean,
            marketplaceLabel(product.marketplace),
          ),
        ),
        ...articles.items.map((article) => toDto('article', article.slug, article.title)),
      );
    }

    return {
      items: dedupeTargets(items),
      productLimit,
      requiresMinSearchLength: INTERNAL_LINK_TARGET_MIN_SEARCH_LENGTH,
    };
  }

  private async resolveTargetUrl(url: string): Promise<InternalLinkTargetDto | null> {
    const parsed = parseInternalLinkTargetUrl(url);
    if (!parsed) {
      return null;
    }

    switch (parsed.type) {
      case 'product': {
        const product = await this.productRepository.findBySlug(parsed.slug);
        return product
          ? toDto(
              'product',
              String(product.slug),
              product.titleClean,
              marketplaceLabel(product.marketplace),
            )
          : null;
      }
      case 'product_category': {
        const category = await this.categoryRepository.findBySlug(parsed.slug);
        return category ? toDto('product_category', category.slug, category.label) : null;
      }
      case 'collection': {
        const collection = await this.collectionRepository.findBySlug(parsed.slug);
        return collection ? toDto('collection', collection.slug, collection.title) : null;
      }
      case 'article': {
        const article = await this.contentRepository.findArticleBySlug(parsed.slug);
        return article ? toDto('article', article.slug, article.title) : null;
      }
      case 'article_category': {
        const category = await this.articleCategoryRepository.findBySlug(parsed.slug);
        return category ? toDto('article_category', category.slug, category.name) : null;
      }
    }
  }
}
