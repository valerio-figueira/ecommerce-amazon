import { Marketplace } from '@ecommerce-amazon/domain';
import type {
  MarketplaceJobData,
  WorkerContainer,
} from '@ecommerce-amazon/infrastructure';

const BATCH_SIZE = 15;

export async function registerSchedulers(container: WorkerContainer) {
  const { queues, productRepository, env } = container;

  await queues.priceRefresh.add(
    'schedule-price-refresh',
    { trigger: 'schedule' },
    {
      repeat: { pattern: '0 */4 * * *' },
      jobId: 'scheduler-price-refresh',
    },
  );

  await queues.catalogSync.add(
    'schedule-catalog-sync',
    { trigger: 'schedule' },
    {
      repeat: { pattern: '0 */6 * * *' },
      jobId: 'scheduler-catalog-sync',
    },
  );

  await queues.hygiene.add(
    'schedule-hygiene',
    {},
    {
      repeat: { pattern: '0 2 * * *' },
      jobId: 'scheduler-hygiene',
    },
  );

  await queues.couponVerify.add(
    'schedule-coupon-verify',
    {},
    {
      repeat: { pattern: '0 */6 * * *' },
      jobId: 'scheduler-coupon-verify',
    },
  );

  if (env.TELEMETRY_BUFFER_ENABLED) {
    await queues.telemetryFlush.add(
      'flush-telemetry-buffer',
      { trigger: 'schedule' },
      {
        repeat: { pattern: env.TELEMETRY_FLUSH_CRON },
        jobId: 'scheduler-telemetry-flush',
      },
    );
  }

  const enqueueBatches = async (): Promise<void> => {
    const products = await productRepository.findDueForPriceRefresh({ limit: 500 });
    const byMarketplace = new Map<Marketplace, string[]>();

    for (const product of products) {
      const list = byMarketplace.get(product.marketplace) ?? [];
      list.push(product.externalId);
      byMarketplace.set(product.marketplace, list);
    }

    for (const [marketplace, externalIds] of byMarketplace) {
      for (let i = 0; i < externalIds.length; i += BATCH_SIZE) {
        const batch = externalIds.slice(i, i + BATCH_SIZE);
        const hourKey = new Date().toISOString().slice(0, 13);
        const jobData: MarketplaceJobData = { marketplace, externalIds: batch };
        await queues.priceRefresh.add('price-batch', jobData, {
          jobId: `price_refresh:${marketplace}:${hourKey}:${i}`,
        });
      }
    }
  };

  void enqueueBatches();

  return { enqueueBatches };
}
