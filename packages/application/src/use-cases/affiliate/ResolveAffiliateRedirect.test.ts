import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccount,
  AffiliateAccountStatus,
  AffiliateLink,
  EntityNotFoundError,
  Marketplace,
  Price,
  Product,
  ProductAvailability,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { createMockProductRepository } from '../../test/mock-factories.js';
import { ResolveAffiliateRedirect } from './ResolveAffiliateRedirect.js';

describe('ResolveAffiliateRedirect', () => {
  it('returns target URL for active affiliate account', async () => {
    const product = Product.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      marketplace: Marketplace.AMAZON_BR,
      externalId: 'B001',
      slug: 'cadeira-ergonomica-home-office',
      titleClean: 'Cadeira',
      titleRaw: 'Cadeira Raw',
      price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
      affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
      images: [],
      specsNormalized: [],
      editorialScore: 80,
      availability: ProductAvailability.IN_STOCK,
      tags: [],
      createdAt: new Date(),
    });

    const productRepository = createMockProductRepository({
      findBySlug: vi.fn().mockResolvedValue(product),
    });

    const affiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue(
        new AffiliateAccount(
          'e1111111-1111-4111-8111-111111111111',
          Marketplace.AMAZON_BR,
          'vitrine-21',
          AffiliateAccountStatus.ACTIVE,
        ),
      ),
    };

    const affiliateLinkBuilder = {
      build: vi.fn(),
      buildBatchCheckout: vi.fn(),
      buildWithTracking: vi.fn().mockReturnValue('https://amazon.com.br/dp/B001?tag=vitrine-21'),
    };

    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new ResolveAffiliateRedirect(
      productRepository,
      affiliateAccountRepository,
      affiliateLinkBuilder,
      gateService,
    );

    const result = await useCase.execute({ slug: 'cadeira-ergonomica-home-office' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.targetUrl).toContain('amazon.com.br');
      expect(result.value.productId).toBe(product.id);
      expect(result.value.marketplace).toBe(Marketplace.AMAZON_BR);
    }
  });

  it('blocks redirect when affiliate account is pending validation', async () => {
    const product = Product.create({
      id: 'a2222222-2222-4222-8222-222222222222',
      marketplace: Marketplace.SHOPEE_BR,
      externalId: 'SHOPEE-1',
      slug: 'headset-gamer-7-1',
      titleClean: 'Headset',
      titleRaw: 'Headset Raw',
      price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
      affiliateLink: AffiliateLink.create('https://shopee.com.br/product/SHOPEE-1', 'shopee_br'),
      images: [],
      specsNormalized: [],
      editorialScore: 80,
      availability: ProductAvailability.IN_STOCK,
      tags: [],
      createdAt: new Date(),
    });

    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new ResolveAffiliateRedirect(
      createMockProductRepository({ findBySlug: vi.fn().mockResolvedValue(product) }),
      {
        findByMarketplace: vi.fn().mockResolvedValue(
          new AffiliateAccount(
            'e2222222-2222-4222-8222-222222222222',
            Marketplace.SHOPEE_BR,
            'pending-tag',
            AffiliateAccountStatus.PENDING,
          ),
        ),
      },
      {
        build: vi.fn(),
        buildBatchCheckout: vi.fn(),
        buildWithTracking: vi.fn(),
      },
      gateService,
    );

    const result = await useCase.execute({ slug: 'headset-gamer-7-1' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(ValidationError);
    }
  });

  it('returns EntityNotFoundError when product is missing', async () => {
    const gateService = {
      isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true),
    };

    const useCase = new ResolveAffiliateRedirect(
      createMockProductRepository({ findBySlug: vi.fn().mockResolvedValue(null) }),
      { findByMarketplace: vi.fn() },
      { build: vi.fn(), buildBatchCheckout: vi.fn(), buildWithTracking: vi.fn() },
      gateService,
    );

    const result = await useCase.execute({ slug: 'missing-product' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(EntityNotFoundError);
    }
  });

  it('passes comparisonSlug to affiliate link builder', async () => {
    const product = Product.create({
      id: 'a1111111-1111-4111-8111-111111111111',
      marketplace: Marketplace.AMAZON_BR,
      externalId: 'B001',
      slug: 'cadeira-ergonomica-home-office',
      titleClean: 'Cadeira',
      titleRaw: 'Cadeira Raw',
      price: Price.create({ amount: 100, currency: 'BRL', updatedAt: new Date() }),
      affiliateLink: AffiliateLink.create('https://amazon.com.br/dp/B001', 'amazon_br'),
      images: [],
      specsNormalized: [],
      editorialScore: 80,
      availability: ProductAvailability.IN_STOCK,
      tags: [],
      createdAt: new Date(),
    });

    const buildWithTracking = vi.fn().mockReturnValue('https://amazon.com.br/dp/B001?tag=vitrine-21');
    const useCase = new ResolveAffiliateRedirect(
      createMockProductRepository({ findBySlug: vi.fn().mockResolvedValue(product) }),
      {
        findByMarketplace: vi.fn().mockResolvedValue(
          new AffiliateAccount(
            'e1111111-1111-4111-8111-111111111111',
            Marketplace.AMAZON_BR,
            'vitrine-21',
            AffiliateAccountStatus.ACTIVE,
          ),
        ),
      },
      { build: vi.fn(), buildBatchCheckout: vi.fn(), buildWithTracking },
      { isBatchCheckoutEnabled: vi.fn().mockResolvedValue(true) },
    );

    await useCase.execute({
      slug: 'cadeira-ergonomica-home-office',
      comparisonSlug: 'cadeira-a-vs-cadeira-b',
    });

    expect(buildWithTracking).toHaveBeenCalledWith(
      Marketplace.AMAZON_BR,
      'B001',
      expect.objectContaining({ comparisonSlug: 'cadeira-a-vs-cadeira-b' }),
      'vitrine-21',
    );
  });
});
