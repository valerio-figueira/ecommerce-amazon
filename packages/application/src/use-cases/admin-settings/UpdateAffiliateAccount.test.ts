import { describe, expect, it, vi } from 'vitest';

import {
  AffiliateAccount,
  AffiliateAccountStatus,
  EntityNotFoundError,
  Marketplace,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { UpdateAffiliateAccount } from './UpdateAffiliateAccount.js';

describe('UpdateAffiliateAccount', () => {
  const account = new AffiliateAccount(
    'e2222222-2222-4222-8222-222222222222',
    Marketplace.SHOPEE_BR,
    'shopee-tag',
    AffiliateAccountStatus.PENDING,
  );

  it('requires checklist confirmation to activate pending account', async () => {
    const affiliateAccountRepository = {
      findById: vi.fn().mockResolvedValue(account),
      findAll: vi.fn(),
      findByMarketplace: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new UpdateAffiliateAccount(affiliateAccountRepository, gateService);

    await expect(
      useCase.execute({
        accountId: account.id,
        operatorEmail: 'admin@vitrine.local',
        status: AffiliateAccountStatus.ACTIVE,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('activates account when checklist is confirmed', async () => {
    const affiliateAccountRepository = {
      findById: vi.fn().mockResolvedValue(account),
      findAll: vi.fn().mockResolvedValue([
        new AffiliateAccount(
          account.id,
          account.marketplace,
          account.affiliateTag,
          AffiliateAccountStatus.ACTIVE,
          'admin@vitrine.local',
          new Date(),
          'Evidência de teste',
        ),
      ]),
      findByMarketplace: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(
        new AffiliateAccount(
          account.id,
          account.marketplace,
          account.affiliateTag,
          AffiliateAccountStatus.ACTIVE,
          'admin@vitrine.local',
          new Date(),
          'Evidência de teste',
        ),
      ),
      delete: vi.fn(),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new UpdateAffiliateAccount(affiliateAccountRepository, gateService);

    const result = await useCase.execute({
      accountId: account.id,
      operatorEmail: 'admin@vitrine.local',
      status: AffiliateAccountStatus.ACTIVE,
      checklistConfirmed: true,
      validationNotes: 'Evidência de teste',
    });

    expect(result.status).toBe(AffiliateAccountStatus.ACTIVE);
    expect(gateService.invalidateSettingsCache).toHaveBeenCalled();
  });

  it('throws when account does not exist', async () => {
    const affiliateAccountRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      findByMarketplace: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new UpdateAffiliateAccount(affiliateAccountRepository, gateService);

    await expect(
      useCase.execute({
        accountId: 'missing',
        operatorEmail: 'admin@vitrine.local',
      }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
