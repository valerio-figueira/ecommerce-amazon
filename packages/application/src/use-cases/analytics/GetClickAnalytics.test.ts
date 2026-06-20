import { describe, expect, it, vi } from 'vitest';

import type { AnalyticsRepository } from '@ecommerce-amazon/domain';

import { GetClicksByMarketplace } from './GetClickAnalytics.js';

describe('GetClicksByMarketplace', () => {
  it('enriches click breakdown with catalog mix and click index', async () => {
    const analyticsRepository: Pick<
      AnalyticsRepository,
      'getClicksByMarketplace' | 'getVisibleProductCountByMarketplace'
    > = {
      getClicksByMarketplace: vi.fn().mockResolvedValue([
        { marketplace: 'amazon_br', count: 80, sharePercent: 80 },
        { marketplace: 'shopee_br', count: 20, sharePercent: 20 },
      ]),
      getVisibleProductCountByMarketplace: vi.fn().mockResolvedValue([
        { marketplace: 'amazon_br', count: 50, sharePercent: 50 },
        { marketplace: 'shopee_br', count: 50, sharePercent: 50 },
      ]),
    };

    const useCase = new GetClicksByMarketplace(analyticsRepository as AnalyticsRepository);
    const result = await useCase.execute();

    expect(result.items).toHaveLength(2);

    const amazon = result.items.find((item) => item.marketplace === 'amazon_br');
    expect(amazon).toMatchObject({
      count: 80,
      sharePercent: 80,
      catalogCount: 50,
      catalogSharePercent: 50,
      clickIndex: 1.6,
    });

    const shopee = result.items.find((item) => item.marketplace === 'shopee_br');
    expect(shopee).toMatchObject({
      count: 20,
      sharePercent: 20,
      catalogCount: 50,
      catalogSharePercent: 50,
      clickIndex: 0.4,
    });
  });

  it('includes marketplaces present only in catalog with zero clicks', async () => {
    const analyticsRepository: Pick<
      AnalyticsRepository,
      'getClicksByMarketplace' | 'getVisibleProductCountByMarketplace'
    > = {
      getClicksByMarketplace: vi
        .fn()
        .mockResolvedValue([{ marketplace: 'amazon_br', count: 10, sharePercent: 100 }]),
      getVisibleProductCountByMarketplace: vi.fn().mockResolvedValue([
        { marketplace: 'amazon_br', count: 8, sharePercent: 80 },
        { marketplace: 'mercadolivre_br', count: 2, sharePercent: 20 },
      ]),
    };

    const useCase = new GetClicksByMarketplace(analyticsRepository as AnalyticsRepository);
    const result = await useCase.execute();

    expect(result.items).toHaveLength(2);
    expect(result.items.find((item) => item.marketplace === 'mercadolivre_br')).toMatchObject({
      count: 0,
      sharePercent: 0,
      catalogCount: 2,
      catalogSharePercent: 20,
      clickIndex: 0,
    });
  });
});
