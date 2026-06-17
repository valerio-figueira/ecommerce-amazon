import {
  UpdatePricesBatch,
  SyncCatalogBatch,
  RunHygienePipeline,
  VerifyCouponsBatch,
  ProcessTriggeredAlerts,
  FlushTelemetryBuffer,
  AffiliateScaleGateService,
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
  TelemetryFlushJobData,
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
import {
  DrizzleClickEventRepository,
  DrizzleCouponRepository,
  DrizzleEngagementEventRepository,
} from '../persistence/repositories/drizzle-content.repository.js';
import { DrizzleAffiliateAccountRepository } from '../persistence/repositories/drizzle-affiliate-account.repository.js';
import { DrizzleSiteSettingsRepository } from '../persistence/repositories/drizzle-site-settings.repository.js';
import { RedisTelemetryBufferStore } from '../telemetry/redis-telemetry-buffer.store.js';

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
  const clickRepository = new DrizzleClickEventRepository(db);
  const engagementRepository = new DrizzleEngagementEventRepository(db);
  const affiliateAccountRepository = new DrizzleAffiliateAccountRepository(db);
  const siteSettingsRepository = new DrizzleSiteSettingsRepository(db);
  const affiliateScaleGateService = new AffiliateScaleGateService(
    siteSettingsRepository,
    affiliateAccountRepository,
    cache,
  );

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

  const telemetryBufferStore = env.TELEMETRY_BUFFER_ENABLED
    ? new RedisTelemetryBufferStore(
        createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_TELEMETRY_DB)),
        env.TELEMETRY_BUFFER_MAX_LEN,
      )
    : null;

  const flushTelemetryBuffer =
    telemetryBufferStore !== null
      ? new FlushTelemetryBuffer(
          telemetryBufferStore,
          clickRepository,
          engagementRepository,
          env.TELEMETRY_FLUSH_BATCH_SIZE,
        )
      : null;

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
      telemetryFlush: createQueue<TelemetryFlushJobData>(
        QUEUE_NAMES.TELEMETRY_FLUSH,
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
      syncCatalogBatch: new SyncCatalogBatch(productRepository, fetcherFactory, cache),
      runHygienePipeline: new RunHygienePipeline(productRepository, cache),
      verifyCouponsBatch: new VerifyCouponsBatch(couponRepository, cache),
      processTriggeredAlerts: new ProcessTriggeredAlerts(
        alertRepository,
        productRepository,
        emailSender,
        eventBus,
        affiliateScaleGateService,
      ),
      flushTelemetryBuffer,
    },
    rateLimiter,
    fetcherFactory,
    productRepository,
  };
}

export type WorkerContainer = ReturnType<typeof buildWorkerContainer>;
