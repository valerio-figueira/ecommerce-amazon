import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccount,
  AffiliateAccountStatus,
  Marketplace,
  ValidationError,
  WishlistItem,
  type AffiliateAccountRepository,
  type AffiliateLinkBuilder,
  type ProductRepository,
  type WishlistRepository,
} from '@ecommerce-amazon/domain';

import { BuildBatchCheckoutRedirect } from './BuildBatchCheckoutRedirect.js';

describe('BuildBatchCheckoutRedirect', () => {
  const sessionId = 'session-abc';
  const marketplace = Marketplace.AMAZON_BR;

  const wishlistItem = WishlistItem.create({
    id: 'w1111111-1111-4111-8111-111111111111',
    sessionId,
    productId: 'a1111111-1111-4111-8111-111111111111',
    marketplace,
    sortOrder: 0,
    addedAt: new Date(),
  });

  it('returns batch checkout url for active affiliate account', async () => {
    const wishlistRepository: WishlistRepository = {
      findBySessionId: vi.fn().mockResolvedValue([wishlistItem]),
      add: vi.fn(),
      remove: vi.fn(),
      removeAllBySessionId: vi.fn(),
      countBySessionAndMarketplace: vi.fn(),
    };

    const productRepository: ProductRepository = {
      findByIds: vi.fn().mockResolvedValue([{ externalId: 'B001' }]),
    } as unknown as ProductRepository;

    const linkBuilder: AffiliateLinkBuilder = {
      build: vi.fn(),
      buildWithTracking: vi.fn(),
      buildBatchCheckout: vi.fn().mockReturnValue('https://amazon.com.br/cart'),
    };

    const affiliateAccountRepository: AffiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue(
        new AffiliateAccount(
          'a1111111-1111-4111-8111-111111111111',
          marketplace,
          'tag-21',
          AffiliateAccountStatus.ACTIVE,
        ),
      ),
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new BuildBatchCheckoutRedirect(
      wishlistRepository,
      productRepository,
      linkBuilder,
      affiliateAccountRepository,
      gateService,
    );

    const result = await useCase.execute({ sessionId, marketplace });

    expect(result).toEqual({
      url: 'https://amazon.com.br/cart',
      itemCount: 1,
    });
  });

  it('rejects when affiliate account is pending validation', async () => {
    const wishlistRepository: WishlistRepository = {
      findBySessionId: vi.fn().mockResolvedValue([wishlistItem]),
      add: vi.fn(),
      remove: vi.fn(),
      removeAllBySessionId: vi.fn(),
      countBySessionAndMarketplace: vi.fn(),
    };

    const productRepository = {} as ProductRepository;
    const linkBuilder = {
      build: vi.fn(),
      buildWithTracking: vi.fn(),
      buildBatchCheckout: vi.fn(),
    } as AffiliateLinkBuilder;

    const affiliateAccountRepository: AffiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue(
        new AffiliateAccount(
          'a1111111-1111-4111-8111-111111111111',
          marketplace,
          'tag-21',
          AffiliateAccountStatus.PENDING,
        ),
      ),
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new BuildBatchCheckoutRedirect(
      wishlistRepository,
      productRepository,
      linkBuilder,
      affiliateAccountRepository,
      gateService,
    );

    await expect(useCase.execute({ sessionId, marketplace })).rejects.toThrow(ValidationError);
  });

  it('rejects when wishlist has no items for marketplace', async () => {
    const wishlistRepository: WishlistRepository = {
      findBySessionId: vi.fn().mockResolvedValue([]),
      add: vi.fn(),
      remove: vi.fn(),
      removeAllBySessionId: vi.fn(),
      countBySessionAndMarketplace: vi.fn(),
    };

    const productRepository = {} as ProductRepository;
    const linkBuilder = {
      build: vi.fn(),
      buildWithTracking: vi.fn(),
      buildBatchCheckout: vi.fn(),
    } as AffiliateLinkBuilder;

    const affiliateAccountRepository: AffiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new BuildBatchCheckoutRedirect(
      wishlistRepository,
      productRepository,
      linkBuilder,
      affiliateAccountRepository,
      gateService,
    );

    await expect(useCase.execute({ sessionId, marketplace })).rejects.toThrow(ValidationError);
  });
});
