import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccount,
  AffiliateAccountStatus,
  EntityNotFoundError,
  Marketplace,
} from '@ecommerce-amazon/domain';

import { DeleteAffiliateAccount } from './DeleteAffiliateAccount.js';

describe('DeleteAffiliateAccount', () => {
  const account = new AffiliateAccount(
    'e2222222-2222-4222-8222-222222222222',
    Marketplace.SHOPEE_BR,
    'shopee-tag',
    AffiliateAccountStatus.PENDING,
  );

  it('deletes existing account and invalidates cache', async () => {
    const affiliateAccountRepository = {
      findById: vi.fn().mockResolvedValue(account),
      findByMarketplace: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new DeleteAffiliateAccount(affiliateAccountRepository, gateService);

    const result = await useCase.execute({ accountId: account.id });

    expect(result).toEqual({ deleted: true });
    expect(affiliateAccountRepository.delete).toHaveBeenCalledWith(account.id);
    expect(gateService.invalidateSettingsCache).toHaveBeenCalled();
  });

  it('throws when account does not exist', async () => {
    const affiliateAccountRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByMarketplace: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new DeleteAffiliateAccount(affiliateAccountRepository, gateService);

    await expect(useCase.execute({ accountId: 'missing' })).rejects.toThrow(EntityNotFoundError);
  });
});
