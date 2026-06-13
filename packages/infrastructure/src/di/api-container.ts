import { loadEnv, createConsoleLogger } from '@ecommerce-amazon/shared';
import {
  GetProductBySlug,
  ListProducts,
  ListAdminProducts,
  GetProductPriceHistory,
  CreateProduct,
  GetAdminProduct,
  UpdateProduct,
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
  ListCategoryTree,
  GetCategoryBySlug,
  ListAdminCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  ReorderCategories,
  GetWishlist,
  SavePageBlock,
  DeletePageBlock,
  UpdatePageBlocksOrder,
  GetAdminPageLayout,
  ListAdminPages,
  ResolveAffiliateRedirect,
  AuthenticateOperator,
} from '@ecommerce-amazon/application';

import { DefaultAffiliateLinkBuilder } from '../affiliate/default-affiliate-link.builder.js';
import { createRedisClient, RedisCacheStore } from '../cache/redis-cache.store.js';
import { parseRedisUrl } from '../cache/redis-connection.js';
import { createDrizzleClient } from '../persistence/drizzle/client.js';
import { DrizzleProductRepository } from '../persistence/repositories/drizzle-product.repository.js';
import { DrizzleCategoryRepository } from '../persistence/repositories/drizzle-category.repository.js';
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
import { DrizzleAffiliateAccountRepository } from '../persistence/repositories/drizzle-affiliate-account.repository.js';
import { DrizzleOperatorRepository } from '../persistence/repositories/drizzle-operator.repository.js';
import { BcryptPasswordHasher } from '../auth/bcrypt-password.hasher.js';
import { JwtAuthTokenService } from '../auth/jwt-auth-token.service.js';

export function buildApiContainer(env = loadEnv()) {
  const logger = createConsoleLogger();
  const db = createDrizzleClient(env.DATABASE_URL);
  const cacheRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_CACHE_DB));
  const cache = new RedisCacheStore(cacheRedis);

  const productRepository = new DrizzleProductRepository(db);
  const categoryRepository = new DrizzleCategoryRepository(db);
  const pageRepository = new DrizzlePageRepository(db);
  const snapshotRepository = new DrizzlePriceSnapshotRepository(db);
  const listProducts = new ListProducts(productRepository, categoryRepository);
  const listAdminProducts = new ListAdminProducts(productRepository);
  const createProduct = new CreateProduct(
    productRepository,
    categoryRepository,
    snapshotRepository,
    cache,
  );
  const getAdminProduct = new GetAdminProduct(productRepository);
  const updateProduct = new UpdateProduct(
    productRepository,
    categoryRepository,
    snapshotRepository,
    cache,
  );
  const alertRepository = new DrizzlePriceAlertRepository(db);
  const wishlistRepository = new DrizzleWishlistRepository(db);
  const contentRepository = new DrizzleContentRepository(db);
  const couponRepository = new DrizzleCouponRepository(db);
  const comparisonRepository = new DrizzleProductComparisonRepository(db);
  const clickRepository = new DrizzleClickEventRepository(db);
  const affiliateAccountRepository = new DrizzleAffiliateAccountRepository(db);
  const operatorRepository = new DrizzleOperatorRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const authTokenService = new JwtAuthTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const linkBuilder = new DefaultAffiliateLinkBuilder(
    env.AMAZON_AFFILIATE_TAG,
    env.SHOPEE_AFFILIATE_ID,
  );

  return {
    logger,
    env,
    useCases: {
      getProductBySlug: new GetProductBySlug(productRepository),
      listProducts,
      listAdminProducts,
      createProduct,
      getAdminProduct,
      updateProduct,
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
      getPublishedPageLayout: new GetPublishedPageLayout(pageRepository, cache, listProducts),
      listCategoryTree: new ListCategoryTree(categoryRepository),
      getCategoryBySlug: new GetCategoryBySlug(categoryRepository),
      listAdminCategories: new ListAdminCategories(categoryRepository),
      createCategory: new CreateCategory(categoryRepository),
      updateCategory: new UpdateCategory(categoryRepository),
      deleteCategory: new DeleteCategory(categoryRepository),
      reorderCategories: new ReorderCategories(categoryRepository),
      getWishlist: new GetWishlist(wishlistRepository, productRepository),
      savePageBlock: new SavePageBlock(pageRepository, cache),
      deletePageBlock: new DeletePageBlock(pageRepository, cache),
      updatePageBlocksOrder: new UpdatePageBlocksOrder(pageRepository, cache),
      getAdminPageLayout: new GetAdminPageLayout(pageRepository),
      listAdminPages: new ListAdminPages(pageRepository),
      resolveAffiliateRedirect: new ResolveAffiliateRedirect(
        productRepository,
        affiliateAccountRepository,
        linkBuilder,
      ),
      authenticateOperator: new AuthenticateOperator(
        operatorRepository,
        passwordHasher,
        authTokenService,
      ),
    },
    services: {
      authTokenService,
    },
    repositories: {
      wishlistRepository,
      pageRepository,
      categoryRepository,
    },
  };
}

export type ApiContainer = ReturnType<typeof buildApiContainer>;
