import type { Product, ProductRepository, WishlistRepository } from '@ecommerce-amazon/domain';

import type { AffiliateScaleGateService } from '../../services/AffiliateScaleGateService.js';
import { resolvePublicShouldShowPrice } from '../../mappers/product-price.mapper.js';

export type WishlistItemEnriched = {
  id: string;
  productId: string;
  marketplace: string;
  sortOrder: number;
  addedAt: string;
  product: {
    slug: string;
    title: string;
    imageUrl?: string | undefined;
    price: {
      amount: number | null;
      currency: string;
      isStale: boolean;
    };
    goUrl: string;
  };
};

export class GetWishlist {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly gateService: AffiliateScaleGateService,
  ) {}

  async execute(sessionId: string): Promise<{ items: WishlistItemEnriched[] }> {
    const pricesEnabled = await this.gateService.isPricesEnabled();
    const items = await this.wishlistRepository.findBySessionId(sessionId);
    if (items.length === 0) return { items: [] };

    const products = await this.productRepository.findByIds(items.map((i) => i.productId));
    const productById = new Map<string, Product>(products.map((p) => [p.id, p]));

    const enriched: WishlistItemEnriched[] = [];
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) continue;

      const shouldShowPrice = resolvePublicShouldShowPrice(product, { pricesEnabled });

      enriched.push({
        id: item.id,
        productId: item.productId,
        marketplace: item.marketplace,
        sortOrder: item.sortOrder,
        addedAt: item.addedAt.toISOString(),
        product: {
          slug: product.slug,
          title: product.titleClean,
          ...(product.images[0] !== undefined ? { imageUrl: product.images[0] } : {}),
          price: {
            amount: shouldShowPrice ? product.price.amount : null,
            currency: product.price.currency,
            isStale: !shouldShowPrice,
          },
          goUrl: `/go/${product.slug}`,
        },
      });
    }

    return { items: enriched };
  }
}
