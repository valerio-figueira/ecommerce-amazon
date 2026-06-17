import { describe, expect, it, vi } from 'vitest';

import { UpdateSiteSettings } from './UpdateSiteSettings.js';

const BASE_SETTINGS = {
  features: {
    priceAlertsEnabled: true,
    batchCheckoutEnabled: true,
    publicIndexingEnabled: true,
  },
  seo: {
    respectAffiliateGate: true,
  },
  cms: {
    publishConfirmRequired: true,
    defaultBlockVisibility: 'all' as const,
  },
};

describe('UpdateSiteSettings', () => {
  it('merges patch and invalidates cache', async () => {
    const siteSettingsRepository = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          settings: BASE_SETTINGS,
          updatedAt: new Date(),
          updatedBy: null,
        })
        .mockResolvedValueOnce({
          settings: {
            ...BASE_SETTINGS,
            features: {
              ...BASE_SETTINGS.features,
              batchCheckoutEnabled: false,
            },
          },
          updatedAt: new Date(),
          updatedBy: '90111111-1111-4111-8111-111111111111',
        }),
      save: vi.fn().mockResolvedValue({
        settings: {
          ...BASE_SETTINGS,
          features: {
            ...BASE_SETTINGS.features,
            batchCheckoutEnabled: false,
          },
        },
        updatedAt: new Date(),
        updatedBy: '90111111-1111-4111-8111-111111111111',
      }),
    };

    const gateService = {
      invalidateSettingsCache: vi.fn(),
    };

    const useCase = new UpdateSiteSettings(siteSettingsRepository, gateService);

    const result = await useCase.execute({
      updatedBy: '90111111-1111-4111-8111-111111111111',
      patch: {
        features: {
          batchCheckoutEnabled: false,
        },
      },
    });

    expect(result.features.batchCheckoutEnabled).toBe(false);
    expect(siteSettingsRepository.save).toHaveBeenCalled();
    expect(gateService.invalidateSettingsCache).toHaveBeenCalled();
  });
});
