import { type WishlistRepository } from '@ecommerce-amazon/domain';

export class ClearWishlist {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.wishlistRepository.removeAllBySessionId(sessionId);
  }
}
