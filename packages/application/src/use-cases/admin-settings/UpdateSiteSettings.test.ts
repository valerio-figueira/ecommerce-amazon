import { describe, expect, it, vi } from 'vitest';

import { UpdateSiteSettings } from './UpdateSiteSettings.js';
import { createMockPublicWebRevalidator } from '../../test/mock-factories.js';

const BASE_SETTINGS = {
  features: {
    priceAlertsEnabled: true,
    batchCheckoutEnabled: true,
    publicIndexingEnabled: true,
    pricesEnabled: true,
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

    const webRevalidator = createMockPublicWebRevalidator();

    const useCase = new UpdateSiteSettings(siteSettingsRepository, gateService, webRevalidator);

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

  it('revalidates public web cache when pricesEnabled changes', async () => {
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
            features: { ...BASE_SETTINGS.features, pricesEnabled: false },
          },
          updatedAt: new Date(),
          updatedBy: '90111111-1111-4111-8111-111111111111',
        }),
      save: vi.fn().mockResolvedValue({
        settings: {
          ...BASE_SETTINGS,
          features: { ...BASE_SETTINGS.features, pricesEnabled: false },
        },
        updatedAt: new Date(),
        updatedBy: '90111111-1111-4111-8111-111111111111',
      }),
    };

    const gateService = { invalidateSettingsCache: vi.fn() };
    const webRevalidator = createMockPublicWebRevalidator();

    const useCase = new UpdateSiteSettings(siteSettingsRepository, gateService, webRevalidator);

    await useCase.execute({
      updatedBy: '90111111-1111-4111-8111-111111111111',
      patch: { features: { pricesEnabled: false } },
    });

    expect(webRevalidator.revalidate).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ['public:site-settings'] }),
    );
  });
});
