import {
  Marketplace,
  Price,
  ProductAvailability,
  UnsupportedMarketplaceError,
  type MarketplaceFetchResult,
  type MarketplaceFetcher,
  type MarketplaceFetcherFactory,
} from '@ecommerce-amazon/domain';

export class AmazonFetcherStrategy implements MarketplaceFetcher {
  readonly marketplace = Marketplace.AMAZON_BR;

  async fetchProduct(externalId: string): Promise<MarketplaceFetchResult> {
    const batch = await this.fetchProductsBatch([externalId]);
    const item = batch[0];
    if (!item) throw new Error(`Product not found: ${externalId}`);
    return item;
  }

  async fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    return externalIds.map((externalId) => ({
      externalId,
      rawTitle: `Amazon Product ${externalId}`,
      price: Price.create({
        amount: 99.9,
        currency: 'BRL',
        updatedAt: new Date(),
        isStale: false,
      }),
      availability: ProductAvailability.IN_STOCK,
      rating: 4.5,
      reviewCount: 100,
      imageUrls: [`https://via.placeholder.com/300?text=${externalId}`],
    }));
  }
}

export class ShopeeFetcherStrategy implements MarketplaceFetcher {
  readonly marketplace = Marketplace.SHOPEE_BR;

  async fetchProduct(externalId: string): Promise<MarketplaceFetchResult> {
    const batch = await this.fetchProductsBatch([externalId]);
    const item = batch[0];
    if (!item) throw new Error(`Product not found: ${externalId}`);
    return item;
  }

  async fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    return externalIds.map((externalId) => ({
      externalId,
      rawTitle: `Shopee Product ${externalId}`,
      price: Price.create({
        amount: 79.9,
        currency: 'BRL',
        updatedAt: new Date(),
        isStale: false,
      }),
      availability: ProductAvailability.IN_STOCK,
      rating: 4.3,
      reviewCount: 250,
      imageUrls: [`https://via.placeholder.com/300?text=${externalId}`],
    }));
  }
}

export class MercadoLivreFetcherStrategy implements MarketplaceFetcher {
  readonly marketplace = Marketplace.MERCADOLIVRE_BR;

  async fetchProduct(externalId: string): Promise<MarketplaceFetchResult> {
    const batch = await this.fetchProductsBatch([externalId]);
    const item = batch[0];
    if (!item) throw new Error(`Product not found: ${externalId}`);
    return item;
  }

  async fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    return externalIds.map((externalId) => ({
      externalId,
      rawTitle: `Mercado Livre Product ${externalId}`,
      price: Price.create({
        amount: 89.9,
        currency: 'BRL',
        updatedAt: new Date(),
        isStale: false,
      }),
      availability: ProductAvailability.IN_STOCK,
      rating: 4.4,
      reviewCount: 180,
      imageUrls: [`https://via.placeholder.com/300?text=${externalId}`],
    }));
  }
}

export class DefaultMarketplaceFetcherFactory implements MarketplaceFetcherFactory {
  private readonly fetchers: Map<Marketplace, MarketplaceFetcher>;

  constructor(fetchers: MarketplaceFetcher[]) {
    this.fetchers = new Map(fetchers.map((f) => [f.marketplace, f]));
  }

  get(marketplace: Marketplace): MarketplaceFetcher {
    const fetcher = this.fetchers.get(marketplace);
    if (!fetcher) throw new UnsupportedMarketplaceError(marketplace);
    return fetcher;
  }
}
