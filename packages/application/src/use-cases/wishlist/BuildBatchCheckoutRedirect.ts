import {
  type AffiliateLinkBuilder,
  type Marketplace,
  type ProductRepository,
  type WishlistRepository,
} from '@ecommerce-amazon/domain';

export class BuildBatchCheckoutRedirect {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
    private readonly linkBuilder: AffiliateLinkBuilder,
  ) {}

  async execute(input: { sessionId: string; marketplace: Marketplace }) {
    const items = await this.wishlistRepository.findBySessionId(input.sessionId);
    const filtered = items.filter((i) => i.marketplace === input.marketplace);
    const products = await this.productRepository.findByIds(filtered.map((i) => i.productId));
    const externalIds = products.map((p) => p.externalId);
    const url = this.linkBuilder.buildBatchCheckout(input.marketplace, externalIds);
    return { url, itemCount: externalIds.length };
  }
}
