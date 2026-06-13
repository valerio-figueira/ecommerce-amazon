import type { Product, ProductRepository, WishlistRepository } from '@ecommerce-amazon/domain';

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
    affiliateUrl: string;
  };
};

export class GetWishlist {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(sessionId: string): Promise<{ items: WishlistItemEnriched[] }> {
    const items = await this.wishlistRepository.findBySessionId(sessionId);
    if (items.length === 0) return { items: [] };

    const products = await this.productRepository.findByIds(items.map((i) => i.productId));
    const productById = new Map<string, Product>(products.map((p) => [p.id, p]));

    const enriched: WishlistItemEnriched[] = [];
    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) continue;

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
            amount: product.price.isStale ? null : product.price.amount,
            currency: product.price.currency,
            isStale: product.price.isStale,
          },
          affiliateUrl: product.affiliateLink.url,
        },
      });
    }

    return { items: enriched };
  }
}
