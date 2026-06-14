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
  ListCuratedCollections,
  ListPublicCollections,
  GetAdminCollection,
  CreateCuratedCollection,
  UpdateCuratedCollection,
  DeleteCuratedCollection,
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
  ListAdminArticles,
  CreateArticle,
  GetAdminArticle,
  UpdateArticle,
  DeleteArticle,
  ListActiveAutoLinks,
  ResolveAffiliateRedirect,
  AuthenticateOperator,
} from '@ecommerce-amazon/application';

import { DefaultAffiliateLinkBuilder } from '../affiliate/default-affiliate-link.builder.js';
import { createRedisClient, RedisCacheStore } from '../cache/redis-cache.store.js';
import { parseRedisUrl } from '../cache/redis-connection.js';
import { createDrizzleClient } from '../persistence/drizzle/client.js';
import { DrizzleProductRepository } from '../persistence/repositories/drizzle-product.repository.js';
import { DrizzleCategoryRepository } from '../persistence/repositories/drizzle-category.repository.js';
import { DrizzleCuratedCollectionRepository } from '../persistence/repositories/drizzle-curated-collection.repository.js';
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
import { DrizzleAutoLinkRepository } from '../persistence/repositories/drizzle-auto-link.repository.js';
import { BcryptPasswordHasher } from '../auth/bcrypt-password.hasher.js';
import { JwtAuthTokenService } from '../auth/jwt-auth-token.service.js';

export function buildApiContainer(env = loadEnv()) {
  const logger = createConsoleLogger();
  const db = createDrizzleClient(env.DATABASE_URL);
  const cacheRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_CACHE_DB));
  const cache = new RedisCacheStore(cacheRedis);

  const productRepository = new DrizzleProductRepository(db);
  const categoryRepository = new DrizzleCategoryRepository(db);
  const curatedCollectionRepository = new DrizzleCuratedCollectionRepository(db);
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
  const contentRepository = new DrizzleContentRepository(db, curatedCollectionRepository);
  const couponRepository = new DrizzleCouponRepository(db);
  const comparisonRepository = new DrizzleProductComparisonRepository(db);
  const clickRepository = new DrizzleClickEventRepository(db);
  const affiliateAccountRepository = new DrizzleAffiliateAccountRepository(db);
  const operatorRepository = new DrizzleOperatorRepository(db);
  const autoLinkRepository = new DrizzleAutoLinkRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const authTokenService = new JwtAuthTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const linkBuilder = new DefaultAffiliateLinkBuilder(
    env.AMAZON_AFFILIATE_TAG,
    env.SHOPEE_AFFILIATE_ID,
  );

  const getCuratedCollection = new GetCuratedCollection(
    curatedCollectionRepository,
    productRepository,
    cache,
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
      getArticleWithEmbeds: new GetArticleWithEmbeds(
        contentRepository,
        operatorRepository,
        cache,
      ),
      getCuratedCollection,
      listCuratedCollections: new ListCuratedCollections(curatedCollectionRepository),
      listPublicCollections: new ListPublicCollections(curatedCollectionRepository),
      getAdminCollection: new GetAdminCollection(curatedCollectionRepository),
      createCuratedCollection: new CreateCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
      ),
      updateCuratedCollection: new UpdateCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
      ),
      deleteCuratedCollection: new DeleteCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
      ),
      createComparison: new CreateComparison(comparisonRepository),
      getComparisonByToken: new GetComparisonByToken(comparisonRepository, productRepository),
      listActiveCoupons: new ListActiveCoupons(couponRepository, cache),
      recordClickEvent: new RecordClickEvent(clickRepository),
      getPublishedPageLayout: new GetPublishedPageLayout(
        pageRepository,
        cache,
        listProducts,
        getCuratedCollection,
        curatedCollectionRepository,
        contentRepository,
        productRepository,
        categoryRepository,
      ),
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
      listAdminArticles: new ListAdminArticles(contentRepository),
      createArticle: new CreateArticle(contentRepository, cache),
      getAdminArticle: new GetAdminArticle(contentRepository),
      updateArticle: new UpdateArticle(contentRepository, cache),
      deleteArticle: new DeleteArticle(contentRepository, cache),
      listActiveAutoLinks: new ListActiveAutoLinks(autoLinkRepository, cache),
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
