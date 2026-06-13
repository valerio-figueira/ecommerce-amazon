import type {
  CacheStore,
  ContentRepository,
  CuratedCollection,
  Product,
  ProductRepository,
} from '@ecommerce-amazon/domain';

export type CuratedCollectionResult = {
  collection: CuratedCollection;
  products: Product[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCuratedCollectionResult(value: unknown): value is CuratedCollectionResult {
  return (
    isRecord(value) &&
    isRecord(value['collection']) &&
    Array.isArray(value['products'])
  );
}

export class GetCuratedCollection {
  constructor(
    private readonly contentRepository: ContentRepository,
    private readonly productRepository: ProductRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(slug: string): Promise<CuratedCollectionResult | null> {
    const cacheKey = `vitrine:collection:slug:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (isCuratedCollectionResult(cached)) {
      return cached;
    }

    const collection = await this.contentRepository.findCollectionBySlug(slug);
    if (!collection) return null;

    const products = await this.productRepository.findByIds(collection.productIds);
    const result: CuratedCollectionResult = { collection, products };
    await this.cache.set(cacheKey, result, 600);
    return result;
  }
}
