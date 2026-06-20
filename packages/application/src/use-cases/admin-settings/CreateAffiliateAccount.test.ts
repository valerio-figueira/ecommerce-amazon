import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccount,
  AffiliateAccountStatus,
  Marketplace,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { CreateAffiliateAccount } from './CreateAffiliateAccount.js';

describe('CreateAffiliateAccount', () => {
  it('creates account with pending status when marketplace is available', async () => {
    const created = new AffiliateAccount(
      'a1111111-1111-4111-8111-111111111111',
      Marketplace.MERCADOLIVRE_BR,
      'ml-tag',
      AffiliateAccountStatus.PENDING,
    );

    const affiliateAccountRepository = {
      findByMarketplace: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue([created]),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(created),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new CreateAffiliateAccount(affiliateAccountRepository, gateService);

    const result = await useCase.execute({
      marketplace: Marketplace.MERCADOLIVRE_BR,
      affiliateTag: 'ml-tag',
    });

    expect(result.marketplace).toBe(Marketplace.MERCADOLIVRE_BR);
    expect(result.status).toBe(AffiliateAccountStatus.PENDING);
    expect(affiliateAccountRepository.create).toHaveBeenCalledWith({
      marketplace: Marketplace.MERCADOLIVRE_BR,
      affiliateTag: 'ml-tag',
      status: AffiliateAccountStatus.PENDING,
    });
    expect(gateService.invalidateSettingsCache).toHaveBeenCalled();
  });

  it('rejects duplicate marketplace', async () => {
    const affiliateAccountRepository = {
      findByMarketplace: vi
        .fn()
        .mockResolvedValue(
          new AffiliateAccount(
            'a1111111-1111-4111-8111-111111111111',
            Marketplace.AMAZON_BR,
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
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new CreateAffiliateAccount(affiliateAccountRepository, gateService);

    await expect(
      useCase.execute({
        marketplace: Marketplace.AMAZON_BR,
        affiliateTag: 'other-tag',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
