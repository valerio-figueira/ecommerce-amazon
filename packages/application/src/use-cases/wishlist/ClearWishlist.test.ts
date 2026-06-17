import { describe, expect, it, vi } from 'vitest';

import type { WishlistRepository } from '@ecommerce-amazon/domain';

import { ClearWishlist } from './ClearWishlist.js';

describe('ClearWishlist', () => {
  it('removes all items for the session', async () => {
    const wishlistRepository: WishlistRepository = {
      findBySessionId: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
      removeAllBySessionId: vi.fn().mockResolvedValue(undefined),
      countBySessionAndMarketplace: vi.fn(),
    };

    const useCase = new ClearWishlist(wishlistRepository);
    await useCase.execute('session-123');

    expect(wishlistRepository.removeAllBySessionId).toHaveBeenCalledWith('session-123');
  });
});
