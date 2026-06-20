import { Worker } from 'bullmq';

import { MarketplaceRateLimitError, isPriceDroppedMessage } from '@ecommerce-amazon/domain';
import type { DomainEventMessage } from '@ecommerce-amazon/domain';
import {
  QUEUE_NAMES,
  type PriceRefreshJobData,
  type CatalogSyncJobData,
  type EmailDeliveryJobData,
  type MarketplaceJobData,
  type TelemetryFlushJobData,
} from '@ecommerce-amazon/infrastructure';
import type { WorkerContainer } from '@ecommerce-amazon/infrastructure';

function isMarketplaceJobData(
  data: PriceRefreshJobData | CatalogSyncJobData,
): data is MarketplaceJobData {
  return 'marketplace' in data && 'externalIds' in data;
}

export function startWorkers(container: WorkerContainer) {
  const { queueConnection, useCases, logger, rateLimiter } = container;

  const priceWorker = new Worker<PriceRefreshJobData>(
    QUEUE_NAMES.PRICE_REFRESH,
    async (job) => {
      if (!isMarketplaceJobData(job.data)) return;
      const { marketplace, externalIds } = job.data;
      await rateLimiter.refill(marketplace, 10);
      try {
        await rateLimiter.acquire(marketplace);
        const result = await useCases.updatePricesBatch.execute({
          marketplace,
          externalIds,
        });
        logger.info('Price batch processed', { jobId: job.id, ...result });
        return result;
      } catch (error) {
        if (error instanceof MarketplaceRateLimitError) {
          await job.moveToDelayed(Date.now() + 5 * 60 * 1000);
        }
        throw error;
      }
    },
    { connection: queueConnection, concurrency: 3 },
  );

  const catalogWorker = new Worker<CatalogSyncJobData>(
    QUEUE_NAMES.CATALOG_SYNC,
    async (job) => {
      if (!isMarketplaceJobData(job.data)) return;
      const { marketplace, externalIds } = job.data;
      await rateLimiter.acquire(marketplace);
      return useCases.syncCatalogBatch.execute({ marketplace, externalIds });
    },
    { connection: queueConnection, concurrency: 2 },
  );

  const hygieneWorker = new Worker(
    QUEUE_NAMES.HYGIENE,
    async () => useCases.runHygienePipeline.execute(),
    { connection: queueConnection, concurrency: 1 },
  );

  const couponWorker = new Worker(
    QUEUE_NAMES.COUPON_VERIFY,
    async () => useCases.verifyCouponsBatch.execute(),
    { connection: queueConnection, concurrency: 1 },
  );

  const domainEventsWorker = new Worker<DomainEventMessage>(
    QUEUE_NAMES.DOMAIN_EVENTS,
    async (job) => {
      if (isPriceDroppedMessage(job.data)) {
        await useCases.processTriggeredAlerts.execute(job.data.productId);
      }
    },
    { connection: queueConnection, concurrency: 2 },
  );

  const emailWorker = new Worker<EmailDeliveryJobData>(
    QUEUE_NAMES.EMAIL_DELIVERY,
    (job) => {
      logger.info('Email delivery job', { to: job.data.to, subject: job.data.subject });
      return Promise.resolve();
    },
    { connection: queueConnection, concurrency: 2 },
  );

  const telemetryFlushWorker = new Worker<TelemetryFlushJobData>(
    QUEUE_NAMES.TELEMETRY_FLUSH,
    async (job) => {
      if (!useCases.flushTelemetryBuffer) {
        logger.warn('Telemetry flush skipped — buffer disabled', { jobId: job.id });
        return;
      }
      const result = await useCases.flushTelemetryBuffer.execute();
      logger.info('Telemetry buffer flushed', { jobId: job.id, ...result });
      return result;
    },
    { connection: queueConnection, concurrency: 1 },
  );

  for (const worker of [
    priceWorker,
    catalogWorker,
    hygieneWorker,
    couponWorker,
    domainEventsWorker,
    emailWorker,
    telemetryFlushWorker,
  ]) {
    worker.on('failed', (job, error) => {
      logger.error('Job failed', { jobId: job?.id, error: error.message });
    });
  }

  return {
    priceWorker,
    catalogWorker,
    hygieneWorker,
    couponWorker,
    domainEventsWorker,
    emailWorker,
    telemetryFlushWorker,
  };
}
