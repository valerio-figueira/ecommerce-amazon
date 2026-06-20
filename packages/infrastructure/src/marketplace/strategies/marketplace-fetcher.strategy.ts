import {
  Marketplace,
  Price,
  ProductAvailability,
  type AffiliateAccountRepository,
  type MarketplaceFetchResult,
  type MarketplaceFetcher,
  type MarketplaceFetcherFactory,
  UnsupportedMarketplaceError,
} from '@ecommerce-amazon/domain';

import type { MarketplaceCredentialResolverPort } from '@ecommerce-amazon/domain';
import { amazonPaApiGetItems } from '../amazon/amazon-pa-api.client.js';
import { shopeeGetItemBaseInfo } from '../shopee/shopee-open-api.client.js';

export class MissingMarketplaceCredentialsError extends Error {
  constructor(marketplace: Marketplace) {
    super(`Marketplace API credentials not configured for ${marketplace}`);
    this.name = 'MissingMarketplaceCredentialsError';
  }
}

function mapAmazonAvailability(value?: string): ProductAvailability {
  if (!value) return ProductAvailability.UNKNOWN;
  const normalized = value.toLowerCase();
  if (normalized.includes('stock')) return ProductAvailability.IN_STOCK;
  if (normalized.includes('unavailable') || normalized.includes('out')) {
    return ProductAvailability.OUT_OF_STOCK;
  }
  return ProductAvailability.UNKNOWN;
}

export class AmazonFetcherStrategy implements MarketplaceFetcher {
  readonly marketplace = Marketplace.AMAZON_BR;

  constructor(
    private readonly credentialResolver: MarketplaceCredentialResolverPort,
    private readonly affiliateAccountRepository: AffiliateAccountRepository,
    private readonly envAffiliateTag = '',
  ) {}

  async fetchProduct(externalId: string): Promise<MarketplaceFetchResult> {
    const batch = await this.fetchProductsBatch([externalId]);
    const item = batch[0];
    if (!item) throw new Error(`Product not found: ${externalId}`);
    return item;
  }

  async fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    const credentials = await this.credentialResolver.resolve(Marketplace.AMAZON_BR);
    if (!credentials || credentials.marketplace !== Marketplace.AMAZON_BR) {
      throw new MissingMarketplaceCredentialsError(Marketplace.AMAZON_BR);
    }

    const affiliateAccount = await this.affiliateAccountRepository.findByMarketplace(
      Marketplace.AMAZON_BR,
    );
    const partnerTag = affiliateAccount?.affiliateTag?.trim() || this.envAffiliateTag.trim();
    if (!partnerTag) {
      throw new Error('Amazon affiliate tag is required for PA-API requests');
    }

    const response = await amazonPaApiGetItems(credentials, {
      itemIds: externalIds,
      partnerTag,
    });

    if (!response.ok) {
      throw new Error(response.message);
    }

    const byAsin = new Map(response.items.map((item) => [item.asin, item]));

    return externalIds.map((externalId) => {
      const item = byAsin.get(externalId);
      if (!item) {
        throw new Error(`Amazon PA-API item not found: ${externalId}`);
      }

      return {
        externalId,
        rawTitle: item.title ?? `Amazon Product ${externalId}`,
        price: Price.create({
          amount: item.priceAmount ?? 0,
          currency: item.priceCurrency === 'USD' ? 'USD' : 'BRL',
          updatedAt: new Date(),
          isStale: false,
        }),
        availability: mapAmazonAvailability(item.availability),
        imageUrls: item.imageUrl ? [item.imageUrl] : [],
      };
    });
  }
}

export class ShopeeFetcherStrategy implements MarketplaceFetcher {
  readonly marketplace = Marketplace.SHOPEE_BR;

  constructor(private readonly credentialResolver: MarketplaceCredentialResolverPort) {}

  async fetchProduct(externalId: string): Promise<MarketplaceFetchResult> {
    const batch = await this.fetchProductsBatch([externalId]);
    const item = batch[0];
    if (!item) throw new Error(`Product not found: ${externalId}`);
    return item;
  }

  async fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    const credentials = await this.credentialResolver.resolve(Marketplace.SHOPEE_BR);
    if (!credentials || credentials.marketplace !== Marketplace.SHOPEE_BR) {
      throw new MissingMarketplaceCredentialsError(Marketplace.SHOPEE_BR);
    }

    const results: MarketplaceFetchResult[] = [];
    for (const externalId of externalIds) {
      const { response, item } = await shopeeGetItemBaseInfo(credentials, externalId);
      if (!response.ok || !item) {
        throw new Error(response.message);
      }

      results.push({
        externalId,
        rawTitle: item.title,
        price: Price.create({
          amount: item.priceAmount ?? 0,
          currency: 'BRL',
          updatedAt: new Date(),
          isStale: false,
        }),
        availability: ProductAvailability.IN_STOCK,
        imageUrls: item.imageUrl ? [item.imageUrl] : [],
      });
    }

    return results;
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

  fetchProductsBatch(externalIds: string[]): Promise<MarketplaceFetchResult[]> {
    return Promise.resolve(
      externalIds.map((externalId) => ({
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
      })),
    );
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
