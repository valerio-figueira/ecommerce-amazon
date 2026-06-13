import {
  UpdatePricesBatch,
  SyncCatalogBatch,
  RunHygienePipeline,
  VerifyCouponsBatch,
  ProcessTriggeredAlerts,
} from '@ecommerce-amazon/application';
import type { DomainEventMessage } from '@ecommerce-amazon/domain';
import { loadEnv, createConsoleLogger } from '@ecommerce-amazon/shared';

import { DefaultAffiliateLinkBuilder } from '../affiliate/default-affiliate-link.builder.js';
import { createRedisClient, RedisCacheStore } from '../cache/redis-cache.store.js';
import { parseRedisUrl } from '../cache/redis-connection.js';
import { ConsoleEmailSender, ResendEmailSender } from '../email/email.sender.js';
import { BullMQEventBus, createQueue, QUEUE_NAMES } from '../messaging/queues.js';
import type {
  CatalogSyncJobData,
  EmailDeliveryJobData,
  PriceRefreshJobData,
} from '../messaging/queues.js';
import {
  AmazonFetcherStrategy,
  DefaultMarketplaceFetcherFactory,
  MercadoLivreFetcherStrategy,
  ShopeeFetcherStrategy,
} from '../marketplace/strategies/marketplace-fetcher.strategy.js';
import { MarketplaceRateLimiter } from '../marketplace/rate-limit/marketplace-rate-limiter.js';
import { createDrizzleClient } from '../persistence/drizzle/client.js';
import { DrizzleProductRepository } from '../persistence/repositories/drizzle-product.repository.js';
import {
  DrizzlePriceAlertRepository,
  DrizzlePriceSnapshotRepository,
} from '../persistence/repositories/drizzle-alert.repository.js';
import { DrizzleCouponRepository } from '../persistence/repositories/drizzle-content.repository.js';

export function buildWorkerContainer(env = loadEnv()) {
  const logger = createConsoleLogger();
  const db = createDrizzleClient(env.DATABASE_URL);
  const cacheRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_CACHE_DB));
  const queueRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_QUEUE_DB));
  const cache = new RedisCacheStore(cacheRedis);

  const productRepository = new DrizzleProductRepository(db);
  const snapshotRepository = new DrizzlePriceSnapshotRepository(db);
  const alertRepository = new DrizzlePriceAlertRepository(db);
  const couponRepository = new DrizzleCouponRepository(db);

  const fetcherFactory = new DefaultMarketplaceFetcherFactory([
    new AmazonFetcherStrategy(),
    new ShopeeFetcherStrategy(),
    new MercadoLivreFetcherStrategy(),
  ]);

  const queueConnection = parseRedisUrl(env.REDIS_URL, env.REDIS_QUEUE_DB);
  const domainEventsQueue = createQueue<DomainEventMessage>(
    QUEUE_NAMES.DOMAIN_EVENTS,
    queueConnection,
  );
  const eventBus = new BullMQEventBus(domainEventsQueue);

  const consoleEmail = new ConsoleEmailSender(logger);
  const emailSender = new ResendEmailSender(env.RESEND_API_KEY, env.EMAIL_FROM, consoleEmail);

  const rateLimiter = new MarketplaceRateLimiter(queueRedis);

  return {
    logger,
    env,
    queueConnection,
    queues: {
      catalogSync: createQueue<CatalogSyncJobData>(QUEUE_NAMES.CATALOG_SYNC, queueConnection),
      priceRefresh: createQueue<PriceRefreshJobData>(QUEUE_NAMES.PRICE_REFRESH, queueConnection),
      hygiene: createQueue(QUEUE_NAMES.HYGIENE, queueConnection),
      couponVerify: createQueue(QUEUE_NAMES.COUPON_VERIFY, queueConnection),
      domainEvents: domainEventsQueue,
      emailDelivery: createQueue<EmailDeliveryJobData>(
        QUEUE_NAMES.EMAIL_DELIVERY,
        queueConnection,
      ),
    },
    useCases: {
      updatePricesBatch: new UpdatePricesBatch(
        productRepository,
        snapshotRepository,
        fetcherFactory,
        eventBus,
        cache,
      ),
      syncCatalogBatch: new SyncCatalogBatch(productRepository, fetcherFactory),
      runHygienePipeline: new RunHygienePipeline(productRepository),
      verifyCouponsBatch: new VerifyCouponsBatch(couponRepository),
      processTriggeredAlerts: new ProcessTriggeredAlerts(
        alertRepository,
        productRepository,
        emailSender,
        eventBus,
      ),
    },
    rateLimiter,
    fetcherFactory,
    productRepository,
  };
}

export type WorkerContainer = ReturnType<typeof buildWorkerContainer>;
