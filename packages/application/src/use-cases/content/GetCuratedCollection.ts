import {
  CuratedCollection,
  PriceComplianceService,
  type CacheStore,
  type CuratedCollectionRepository,
  type Product,
  type ProductRepository,
} from '@ecommerce-amazon/domain';

import { applyPriceComplianceToProducts } from '../../services/apply-price-compliance.js';

export type CuratedCollectionResult = {
  collection: CuratedCollection;
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export type GetCuratedCollectionOptions = {
  page?: number;
  pageSize?: number;
};

type CachedCollectionShell = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  campaignOrigin: string;
  utmDefaults: Record<string, string>;
  ctaText: string;
  createdAt: string;
  updatedAt: string;
  productIds: string[];
};

type CachedCollectionEntry = {
  collection: CachedCollectionShell;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCachedCollectionEntry(value: unknown): value is CachedCollectionEntry {
  if (!isRecord(value) || !isRecord(value['collection'])) {
    return false;
  }

  const collection = value['collection'];
  return (
    typeof collection['id'] === 'string' &&
    typeof collection['slug'] === 'string' &&
    typeof collection['updatedAt'] === 'string' &&
    Array.isArray(collection['productIds'])
  );
}

function shellFromCollection(collection: CuratedCollection): CachedCollectionShell {
  return {
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    description: collection.description,
    coverImageUrl: collection.coverImageUrl,
    campaignOrigin: collection.campaignOrigin,
    utmDefaults: collection.utmDefaults,
    ctaText: collection.ctaText,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    productIds: collection.productIds,
  };
}

function collectionFromShell(shell: CachedCollectionShell): CuratedCollection {
  return CuratedCollection.create({
    id: shell.id,
    slug: shell.slug,
    title: shell.title,
    description: shell.description,
    coverImageUrl: shell.coverImageUrl,
    campaignOrigin: shell.campaignOrigin,
    utmDefaults: shell.utmDefaults,
    ctaText: shell.ctaText,
    productIds: shell.productIds,
    createdAt: new Date(shell.createdAt),
    updatedAt: new Date(shell.updatedAt),
  });
}

function orderProducts(productIds: string[], products: Product[]): Product[] {
  const byId = new Map(products.map((product) => [String(product.id), product]));
  return productIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product !== undefined);
}

/** @deprecated Use isCachedCollectionEntry — kept for backwards compatibility in tests */
export function isCuratedCollectionResult(value: unknown): value is CuratedCollectionResult {
  return isRecord(value) && isRecord(value['collection']) && Array.isArray(value['products']);
}

export class GetCuratedCollection {
  constructor(
    private readonly collectionRepository: CuratedCollectionRepository,
    private readonly productRepository: ProductRepository,
    private readonly cache: CacheStore,
    private readonly compliance = new PriceComplianceService(),
  ) {}

  async execute(
    slug: string,
    options?: GetCuratedCollectionOptions,
  ): Promise<CuratedCollectionResult | null> {
    const cacheKey = `vitrine:collection:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);

    let shell: CachedCollectionShell | null = null;

    if (isCachedCollectionEntry(cached)) {
      shell = cached.collection;
    } else {
      const collection = await this.collectionRepository.findBySlug(slug);
      if (!collection) return null;
      shell = shellFromCollection(collection);
      await this.cache.set(cacheKey, { collection: shell } satisfies CachedCollectionEntry, 600);
    }

    const products = await this.productRepository.findByIds(shell.productIds);
    const orderedProducts = orderProducts(shell.productIds, products);
    applyPriceComplianceToProducts(orderedProducts, this.compliance);

    const total = orderedProducts.length;
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? total;
    const start = (page - 1) * pageSize;
    const paginatedProducts =
      options?.pageSize !== undefined
        ? orderedProducts.slice(start, start + pageSize)
        : orderedProducts;

    return {
      collection: collectionFromShell(shell),
      products: paginatedProducts,
      total,
      page,
      pageSize: options?.pageSize !== undefined ? pageSize : total,
    };
  }
}
