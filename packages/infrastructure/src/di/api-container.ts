import { loadEnv, createConsoleLogger } from '@ecommerce-amazon/shared';
import {
  GetProductBySlug,
  ListProducts,
  GetProductPriceHistory,
  CreatePriceAlert,
  ConfirmPriceAlert,
  AddToWishlist,
  BuildBatchCheckoutRedirect,
  GetArticleWithEmbeds,
  GetCuratedCollection,
  CreateComparison,
  GetComparisonByToken,
  ListActiveCoupons,
  RecordClickEvent,
  GetPublishedPageLayout,
  ListProductCategories,
  GetWishlist,
} from '@ecommerce-amazon/application';

import { DefaultAffiliateLinkBuilder } from '../affiliate/default-affiliate-link.builder.js';
import { createRedisClient, RedisCacheStore } from '../cache/redis-cache.store.js';
import { parseRedisUrl } from '../cache/redis-connection.js';
import { createDrizzleClient } from '../persistence/drizzle/client.js';
import { DrizzleProductRepository } from '../persistence/repositories/drizzle-product.repository.js';
import { DrizzlePageRepository } from '../persistence/repositories/drizzle-page.repository.js';
import {
  DrizzlePriceAlertRepository,
  DrizzlePriceSnapshotRepository,
  DrizzleWishlistRepository,
} from '../persistence/repositories/drizzle-alert.repository.js';
import {
  DrizzleContentRepository,
  DrizzleCouponRepository,
  DrizzleProductComparisonRepository,
  DrizzleClickEventRepository,
} from '../persistence/repositories/drizzle-content.repository.js';

export function buildApiContainer(env = loadEnv()) {
  const logger = createConsoleLogger();
  const db = createDrizzleClient(env.DATABASE_URL);
  const cacheRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_CACHE_DB));
  const cache = new RedisCacheStore(cacheRedis);

  const productRepository = new DrizzleProductRepository(db);
  const pageRepository = new DrizzlePageRepository(db);
  const snapshotRepository = new DrizzlePriceSnapshotRepository(db);
  const alertRepository = new DrizzlePriceAlertRepository(db);
  const wishlistRepository = new DrizzleWishlistRepository(db);
  const contentRepository = new DrizzleContentRepository(db);
  const couponRepository = new DrizzleCouponRepository(db);
  const comparisonRepository = new DrizzleProductComparisonRepository(db);
  const clickRepository = new DrizzleClickEventRepository(db);

  const linkBuilder = new DefaultAffiliateLinkBuilder(
    env.AMAZON_AFFILIATE_TAG,
    env.SHOPEE_AFFILIATE_ID,
  );

  return {
    logger,
    env,
    useCases: {
      getProductBySlug: new GetProductBySlug(productRepository),
      listProducts: new ListProducts(productRepository),
      getProductPriceHistory: new GetProductPriceHistory(snapshotRepository, cache),
      createPriceAlert: new CreatePriceAlert(alertRepository, productRepository),
      confirmPriceAlert: new ConfirmPriceAlert(alertRepository),
      addToWishlist: new AddToWishlist(wishlistRepository, productRepository),
      buildBatchCheckoutRedirect: new BuildBatchCheckoutRedirect(
        wishlistRepository,
        productRepository,
        linkBuilder,
      ),
      getArticleWithEmbeds: new GetArticleWithEmbeds(contentRepository, productRepository, cache),
      getCuratedCollection: new GetCuratedCollection(contentRepository, productRepository, cache),
      createComparison: new CreateComparison(comparisonRepository),
      getComparisonByToken: new GetComparisonByToken(comparisonRepository, productRepository),
      listActiveCoupons: new ListActiveCoupons(couponRepository, cache),
      recordClickEvent: new RecordClickEvent(clickRepository),
      getPublishedPageLayout: new GetPublishedPageLayout(pageRepository, cache),
      listProductCategories: new ListProductCategories(productRepository),
      getWishlist: new GetWishlist(wishlistRepository, productRepository),
    },
    repositories: {
      wishlistRepository,
    },
  };
}

export type ApiContainer = ReturnType<typeof buildApiContainer>;
