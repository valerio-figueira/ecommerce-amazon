import { loadEnv, createConsoleLogger } from '@ecommerce-amazon/shared';
import {
  GetProductBySlug,
  GetProductWithEmbeds,
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
  ListPublishedArticlesByCategory,
  ListPublishedArticles,
  ListPublicArticleCategories,
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
  CreateAutoLink,
  UpdateAutoLink,
  DeleteAutoLink,
  ListAutoLinksAdmin,
  ResolveAffiliateRedirect,
  AuthenticateOperator,
  CreateArticleCategory,
  ListArticleCategories,
  UpdateArticleCategory,
  DeleteArticleCategory,
  GetOperatorProfile,
  UpdateOperatorProfile,
  UploadOperatorAvatar,
  RemoveOperatorAvatar,
  UploadAdminImage,
} from '@ecommerce-amazon/application';

import { DefaultAffiliateLinkBuilder } from '../affiliate/default-affiliate-link.builder.js';
import { createRedisClient, RedisCacheStore } from '../cache/redis-cache.store.js';
import {
  HttpPublicWebRevalidator,
  NoOpPublicWebRevalidator,
} from '../cache/http-public-web.revalidator.js';
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
import { DrizzleArticleCategoryRepository } from '../persistence/repositories/drizzle-article-category.repository.js';
import { DrizzleAffiliateAccountRepository } from '../persistence/repositories/drizzle-affiliate-account.repository.js';
import { DrizzleOperatorRepository } from '../persistence/repositories/drizzle-operator.repository.js';
import { DrizzleAutoLinkRepository } from '../persistence/repositories/drizzle-auto-link.repository.js';
import { BcryptPasswordHasher } from '../auth/bcrypt-password.hasher.js';
import { JwtAuthTokenService } from '../auth/jwt-auth-token.service.js';
import { createObjectStorage } from '../storage/object-storage.factory.js';

export function buildApiContainer(env = loadEnv()) {
  const logger = createConsoleLogger();
  const db = createDrizzleClient(env.DATABASE_URL);
  const cacheRedis = createRedisClient(parseRedisUrl(env.REDIS_URL, env.REDIS_CACHE_DB));
  const cache = new RedisCacheStore(cacheRedis);
  const webRevalidator = env.REVALIDATE_SECRET
    ? new HttpPublicWebRevalidator(env.WEB_PUBLIC_URL, env.REVALIDATE_SECRET, logger)
    : new NoOpPublicWebRevalidator();

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
    webRevalidator,
  );
  const getAdminProduct = new GetAdminProduct(productRepository);
  const updateProduct = new UpdateProduct(
    productRepository,
    categoryRepository,
    snapshotRepository,
    cache,
    webRevalidator,
  );
  const alertRepository = new DrizzlePriceAlertRepository(db);
  const wishlistRepository = new DrizzleWishlistRepository(db);
  const contentRepository = new DrizzleContentRepository(db, curatedCollectionRepository);
  const couponRepository = new DrizzleCouponRepository(db);
  const comparisonRepository = new DrizzleProductComparisonRepository(db);
  const clickRepository = new DrizzleClickEventRepository(db);
  const affiliateAccountRepository = new DrizzleAffiliateAccountRepository(db);
  const operatorRepository = new DrizzleOperatorRepository(db);
  const articleCategoryRepository = new DrizzleArticleCategoryRepository(db);
  const autoLinkRepository = new DrizzleAutoLinkRepository(db);
  const passwordHasher = new BcryptPasswordHasher();
  const authTokenService = new JwtAuthTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);
  const objectStorage = createObjectStorage(env);
  const isManagedAvatarUrl = (url: string) => objectStorage.isManagedUrl(url);

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
      getProductWithEmbeds: new GetProductWithEmbeds(productRepository),
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
        articleCategoryRepository,
        productRepository,
        cache,
      ),
      listPublishedArticlesByCategory: new ListPublishedArticlesByCategory(
        contentRepository,
        articleCategoryRepository,
      ),
      listPublishedArticles: new ListPublishedArticles(contentRepository),
      listPublicArticleCategories: new ListPublicArticleCategories(contentRepository),
      getCuratedCollection,
      listCuratedCollections: new ListCuratedCollections(curatedCollectionRepository),
      listPublicCollections: new ListPublicCollections(curatedCollectionRepository),
      getAdminCollection: new GetAdminCollection(curatedCollectionRepository),
      createCuratedCollection: new CreateCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
        webRevalidator,
      ),
      updateCuratedCollection: new UpdateCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
        webRevalidator,
      ),
      deleteCuratedCollection: new DeleteCuratedCollection(
        curatedCollectionRepository,
        cache,
        cache,
        webRevalidator,
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
      createCategory: new CreateCategory(categoryRepository, webRevalidator),
      updateCategory: new UpdateCategory(categoryRepository, webRevalidator),
      deleteCategory: new DeleteCategory(categoryRepository, webRevalidator),
      reorderCategories: new ReorderCategories(categoryRepository, webRevalidator),
      getWishlist: new GetWishlist(wishlistRepository, productRepository),
      savePageBlock: new SavePageBlock(pageRepository, cache, webRevalidator),
      deletePageBlock: new DeletePageBlock(pageRepository, cache, webRevalidator),
      updatePageBlocksOrder: new UpdatePageBlocksOrder(pageRepository, cache, webRevalidator),
      getAdminPageLayout: new GetAdminPageLayout(pageRepository),
      listAdminPages: new ListAdminPages(pageRepository),
      listAdminArticles: new ListAdminArticles(contentRepository),
      createArticle: new CreateArticle(contentRepository, cache, webRevalidator),
      getAdminArticle: new GetAdminArticle(contentRepository),
      updateArticle: new UpdateArticle(contentRepository, cache, webRevalidator),
      deleteArticle: new DeleteArticle(contentRepository, cache, webRevalidator),
      listActiveAutoLinks: new ListActiveAutoLinks(autoLinkRepository, cache),
      createAutoLink: new CreateAutoLink(autoLinkRepository, cache, webRevalidator),
      updateAutoLink: new UpdateAutoLink(autoLinkRepository, cache, webRevalidator),
      deleteAutoLink: new DeleteAutoLink(autoLinkRepository, cache, webRevalidator),
      listAutoLinksAdmin: new ListAutoLinksAdmin(autoLinkRepository),
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
      listArticleCategories: new ListArticleCategories(articleCategoryRepository),
      createArticleCategory: new CreateArticleCategory(articleCategoryRepository),
      updateArticleCategory: new UpdateArticleCategory(
        articleCategoryRepository,
        cache,
        webRevalidator,
      ),
      deleteArticleCategory: new DeleteArticleCategory(
        articleCategoryRepository,
        cache,
        webRevalidator,
      ),
      getOperatorProfile: new GetOperatorProfile(operatorRepository, isManagedAvatarUrl),
      updateOperatorProfile: new UpdateOperatorProfile(
        operatorRepository,
        authTokenService,
        isManagedAvatarUrl,
      ),
      uploadOperatorAvatar: new UploadOperatorAvatar(operatorRepository, objectStorage),
      removeOperatorAvatar: new RemoveOperatorAvatar(operatorRepository, objectStorage),
      uploadAdminImage: new UploadAdminImage(objectStorage),
    },
    services: {
      authTokenService,
      objectStorage,
    },
    repositories: {
      wishlistRepository,
      pageRepository,
      categoryRepository,
    },
  };
}

export type ApiContainer = ReturnType<typeof buildApiContainer>;
