import { randomUUID } from 'node:crypto';

import {
  ValidationError,
  WishlistItem,
  type ProductRepository,
  type WishlistRepository,
} from '@ecommerce-amazon/domain';

export class AddToWishlist {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: { sessionId: string; productId: string }) {
    const product = await this.productRepository.findById(input.productId);
    if (!product) throw new ValidationError('Product not found');

    const count = await this.wishlistRepository.countBySessionAndMarketplace(
      input.sessionId,
      product.marketplace,
    );
    if (count >= 10) {
      throw new ValidationError('Maximum 10 items per marketplace in wishlist');
    }

    const item = WishlistItem.create({
      id: randomUUID(),
      sessionId: input.sessionId,
      productId: input.productId,
      marketplace: product.marketplace,
      sortOrder: count,
      addedAt: new Date(),
    });

    await this.wishlistRepository.add(item);
    return { id: item.id };
  }
}
