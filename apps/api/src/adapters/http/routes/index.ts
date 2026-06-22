import { randomUUID } from 'node:crypto';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sql } from 'drizzle-orm';
import { ZodError } from 'zod';

import {
  DomainError,
  parseMarketplace,
  parseProductSortField,
  ValidationError,
  type Marketplace,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

import { registerAdminRoutes } from './admin-routes.js';
import { registerInstitutionalRoutes } from './institutional-routes.js';
import { registerPublicSiteSettingsRoute } from './admin-settings-routes.js';
import {
  toProductDetailWithEmbedsDto,
  mapProductsToListItemDtos,
  toCuratedCollectionDto,
} from '../../presenters/product.presenter.js';
import { toProductCategorySummaryDto } from '../../presenters/category.presenter.js';
import { toArticlePublicDetailDto } from '../../presenters/article.presenter.js';
import { toComparisonPublicDto } from '../../presenters/comparison.presenter.js';
import {
  listArticlesByCategoryQuerySchema,
  listPublishedArticlesQuerySchema,
} from '@ecommerce-amazon/shared/admin';
import { isRecord } from '@ecommerce-amazon/shared/utils/type-guards';
import { sitemapEntriesQuerySchema, sitemapMetaQuerySchema } from '@ecommerce-amazon/shared/seo';
import {
  ArticleSlugParamsSchema,
  BatchCheckoutSchema,
  CollectionSlugParamsSchema,
  GetCuratedCollectionQuerySchema,
  ComparisonIdentifierParamsSchema,
  ConfirmPriceAlertParamsSchema,
  CancelPriceAlertParamsSchema,
  CreateComparisonSchema,
  CreatePriceAlertSchema,
  GoAutoLinkIdParamsSchema,
  GoQuerySchema,
  GoSlugParamsSchema,
  ListProductsQuerySchema,
  PageSlugParamsSchema,
  ProductIdParamsSchema,
  ProductSlugParamsSchema,
  CategorySlugParamsSchema,
  RecordClickSchema,
  RecordEngagementSchema,
  PriceHistoryQuerySchema,
  WishlistAddSchema,
  WishlistRemoveParamsSchema,
} from '../../dtos/request/schemas.js';

function getSessionId(request: FastifyRequest): string {
  const header = request.headers['x-session-id'];
  if (typeof header === 'string' && header.length > 0) return header;
  return randomUUID();
}

function handleError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof ValidationError || error instanceof DomainError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

export function registerRoutes(app: FastifyInstance, container: ApiContainer) {
  const { useCases } = container;

  const resolvePublicPriceOptions = async () => ({
    pricesEnabled: await container.services.affiliateScaleGateService.isPricesEnabled(),
  });

  const loadProductCategory = async (categoryId: string) => {
    const category = await container.repositories.categoryRepository.findById(categoryId);
    return category ? { id: category.id, slug: category.slug, label: category.label } : null;
  };

  app.get('/health', () => ({ status: 'ok' }));

  app.get('/health/ready', async (_request, reply) => {
    try {
      await container.db.execute(sql`SELECT 1`);
      return { status: 'ok' };
    } catch {
      return reply.status(503).send({ status: 'unavailable' });
    }
  });

  app.get('/go/alink/:id', async (request, reply) => {
    try {
      const { id } = GoAutoLinkIdParamsSchema.parse(request.params);
      const query = GoQuerySchema.parse(request.query);
      const headerSessionId = request.headers['x-session-id'];
      const sessionId =
        query.sessionId ??
        (typeof headerSessionId === 'string' && headerSessionId.length > 0
          ? headerSessionId
          : undefined);

      const result = await useCases.resolveAutoLinkRedirect.execute({
        id,
        ...(query.blockId !== undefined ? { blockId: query.blockId } : {}),
        ...(sessionId !== undefined ? { sessionId } : {}),
        origin: query.origin ?? 'auto_link',
        ...(query.articleId !== undefined ? { articleId: query.articleId } : {}),
        ...(query.placement !== undefined ? { placement: query.placement } : {}),
        ...(query.pagePath !== undefined ? { pagePath: query.pagePath } : {}),
        ...(query.referrerPath !== undefined ? { referrerPath: query.referrerPath } : {}),
        ...(query.utm_source !== undefined ? { utmSource: query.utm_source } : {}),
        ...(query.utm_medium !== undefined ? { utmMedium: query.utm_medium } : {}),
        ...(query.utm_campaign !== undefined ? { utmCampaign: query.utm_campaign } : {}),
      });

      if (!result.ok) {
        return reply.redirect('/', 307);
      }

      return reply.redirect(result.value.targetUrl, 307);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/go/:slug', async (request, reply) => {
    try {
      const { slug } = GoSlugParamsSchema.parse(request.params);
      const query = GoQuerySchema.parse(request.query);
      const headerSessionId = request.headers['x-session-id'];
      const sessionId =
        query.sessionId ??
        (typeof headerSessionId === 'string' && headerSessionId.length > 0
          ? headerSessionId
          : undefined);

      const result = await useCases.resolveAffiliateRedirect.execute({
        slug,
        ...(query.blockId !== undefined ? { blockId: query.blockId } : {}),
        ...(sessionId !== undefined ? { sessionId } : {}),
        origin: query.origin ?? 'redirect_go',
        ...(query.comparisonSlug !== undefined ? { comparisonSlug: query.comparisonSlug } : {}),
        ...(query.utm_source !== undefined ? { utmSource: query.utm_source } : {}),
        ...(query.utm_medium !== undefined ? { utmMedium: query.utm_medium } : {}),
        ...(query.utm_campaign !== undefined ? { utmCampaign: query.utm_campaign } : {}),
      });

      if (!result.ok) {
        return reply.redirect('/', 307);
      }

      try {
        await useCases.recordClickEvent.execute({
          productId: result.value.productId,
          marketplace: result.value.marketplace,
          origin: query.origin ?? 'redirect_go',
          ...(query.blockId !== undefined ? { blockId: query.blockId } : {}),
          ...(query.articleId !== undefined ? { articleId: query.articleId } : {}),
          ...(query.collectionId !== undefined ? { collectionId: query.collectionId } : {}),
          ...(query.placement !== undefined ? { placement: query.placement } : {}),
          ...(query.pagePath !== undefined ? { pagePath: query.pagePath } : {}),
          ...(query.referrerPath !== undefined ? { referrerPath: query.referrerPath } : {}),
          ...(sessionId !== undefined ? { sessionId } : {}),
        });
      } catch (error: unknown) {
        container.logger.error('Telemetry failed for /go redirect', {
          slug,
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return reply.redirect(result.value.targetUrl, 307);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/categories', async (_request, reply) => {
    try {
      const result = await useCases.listCategoryTree.execute();
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/categories/:slug', async (request, reply) => {
    try {
      const { slug } = CategorySlugParamsSchema.parse(request.params);
      const category = await useCases.getCategoryBySlug.execute(slug);
      if (!category) {
        return reply.status(404).send({ error: 'Category not found' });
      }
      return reply.send(category);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/pages/:slug', async (request, reply) => {
    try {
      const { slug } = PageSlugParamsSchema.parse(request.params);
      const layout = await useCases.getPublishedPageLayout.execute(slug);
      if (!layout) return reply.status(404).send({ error: 'Page not found' });
      return reply.send(layout);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/products', async (request, reply) => {
    try {
      const query = ListProductsQuerySchema.parse(request.query);
      const filters: {
        page?: number;
        pageSize?: number;
        category?: string;
        marketplace?: Marketplace;
        sort?: import('@ecommerce-amazon/domain').ProductSortField;
        visibleOnly?: boolean;
        search?: string;
      } = {};
      if (query.page !== undefined) filters.page = query.page;
      if (query.pageSize !== undefined) filters.pageSize = query.pageSize;
      if (query.category !== undefined) filters.category = query.category;
      if (query.marketplace !== undefined) {
        filters.marketplace = parseMarketplace(query.marketplace);
      }
      if (query.sort !== undefined) {
        filters.sort = parseProductSortField(query.sort);
      }
      if (query.visibleOnly !== undefined) {
        filters.visibleOnly = query.visibleOnly;
      }
      if (query.search !== undefined && query.search.length > 0) {
        filters.search = query.search;
        filters.visibleOnly = filters.visibleOnly ?? true;
      }
      const result = await useCases.listProducts.execute(filters);
      const priceOptions = await resolvePublicPriceOptions();
      const items = await mapProductsToListItemDtos(
        result.items,
        loadProductCategory,
        priceOptions,
      );
      return reply.send({
        items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/products/:slug', async (request, reply) => {
    try {
      const { slug } = ProductSlugParamsSchema.parse(request.params);
      const result = await useCases.getProductWithEmbeds.execute(slug);
      if (!result) return reply.status(404).send({ error: 'Product not found' });

      const priceOptions = await resolvePublicPriceOptions();
      const dto = toProductDetailWithEmbedsDto(
        result.product,
        result.similarProducts,
        priceOptions,
      );
      if (result.product.categoryId) {
        const category = await container.repositories.categoryRepository.findById(
          result.product.categoryId,
        );
        if (category) {
          const ancestors = await container.repositories.categoryRepository.getAncestorChain(
            category.id,
          );
          return reply.send({
            ...dto,
            categoryId: category.id,
            categorySlug: category.slug,
            categoryLabel: category.label,
            category: toProductCategorySummaryDto(category, ancestors),
          });
        }
      }

      return reply.send(dto);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/products/:id/price-history', async (request, reply) => {
    try {
      const pricesEnabled = await container.services.affiliateScaleGateService.isPricesEnabled();
      if (!pricesEnabled) {
        return reply.status(403).send({ error: 'Price history is disabled by platform settings' });
      }

      const { id } = ProductIdParamsSchema.parse(request.params);
      const { days } = PriceHistoryQuerySchema.parse(request.query);
      const history = await useCases.getProductPriceHistory.execute(id, days);
      return reply.send({
        snapshots: history.snapshots.map((s) => ({
          amount: s.price.amount,
          currency: s.price.currency,
          capturedAt: s.capturedAt.toISOString(),
        })),
        days: history.days,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/price-alerts', async (request, reply) => {
    try {
      const body = CreatePriceAlertSchema.parse(request.body);
      const result = await useCases.createPriceAlert.execute({
        ...body,
        confirmToken: randomUUID(),
      });
      if (!result.ok) return reply.status(400).send({ error: result.error.message });
      return reply.status(201).send(result.value);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/price-alerts/confirm/:token', async (request, reply) => {
    try {
      const { token } = ConfirmPriceAlertParamsSchema.parse(request.params);
      const result = await useCases.confirmPriceAlert.execute(token);
      if (!result.ok) return reply.status(400).send({ error: result.error.message });
      return reply.send({ confirmed: true });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.delete('/price-alerts/:token', async (request, reply) => {
    try {
      const { token } = CancelPriceAlertParamsSchema.parse(request.params);
      const result = await useCases.cancelPriceAlert.execute(token);
      if (!result.ok) return reply.status(400).send({ error: result.error.message });
      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/wishlist', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      const result = await useCases.getWishlist.execute(sessionId);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/wishlist', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      const body = WishlistAddSchema.parse(request.body);
      const result = await useCases.addToWishlist.execute({ sessionId, productId: body.productId });
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.delete('/wishlist/:id', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      const { id } = WishlistRemoveParamsSchema.parse(request.params);
      await container.repositories.wishlistRepository.remove(id, sessionId);
      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.delete('/wishlist', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      await useCases.clearWishlist.execute(sessionId);
      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/wishlist/checkout-batch', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      const body = BatchCheckoutSchema.parse(request.body);
      const result = await useCases.buildBatchCheckoutRedirect.execute({
        sessionId,
        marketplace: parseMarketplace(body.marketplace),
      });
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/articles', async (request, reply) => {
    try {
      const rawQuery: unknown = request.query;
      const queryRecord = isRecord(rawQuery) ? rawQuery : {};

      if (
        typeof queryRecord['category'] === 'string' &&
        queryRecord['search'] === undefined &&
        queryRecord['page'] === undefined &&
        queryRecord['limit'] === undefined
      ) {
        const { category } = listArticlesByCategoryQuerySchema.parse(rawQuery);
        const result = await useCases.listPublishedArticlesByCategory.execute(category);
        if (!result) return reply.status(404).send({ error: 'Category not found' });
        return reply.send(result);
      }

      const parsed = listPublishedArticlesQuerySchema.parse(rawQuery);
      const result = await useCases.listPublishedArticles.execute({
        ...(parsed.category !== undefined ? { categorySlug: parsed.category } : {}),
        ...(parsed.search !== undefined ? { search: parsed.search } : {}),
        page: parsed.page,
        limit: parsed.limit,
      });
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/article-categories', async (_request, reply) => {
    try {
      const result = await useCases.listPublicArticleCategories.execute();
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/articles/:slug', async (request, reply) => {
    try {
      const { slug } = ArticleSlugParamsSchema.parse(request.params);
      const result = await useCases.getArticleWithEmbeds.execute(slug);
      if (!result) return reply.status(404).send({ error: 'Article not found' });
      const priceOptions = await resolvePublicPriceOptions();
      return reply.send(toArticlePublicDetailDto(result, priceOptions));
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/seo/auto-links', async (_request, reply) => {
    try {
      const result = await useCases.listActiveAutoLinks.execute();
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  const sitemapCacheControl = 'public, s-maxage=3600, stale-while-revalidate=86400';

  app.get('/seo/sitemap-meta', async (request, reply) => {
    try {
      const query = sitemapMetaQuerySchema.parse(request.query);
      const result = await useCases.getSitemapMeta.execute({
        ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
      });
      return reply.header('Cache-Control', sitemapCacheControl).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/seo/sitemap-entries', async (request, reply) => {
    try {
      const query = sitemapEntriesQuerySchema.parse(request.query);
      const result = await useCases.listSitemapEntries.execute({
        ...(query.page !== undefined ? { page: query.page } : {}),
        ...(query.pageSize !== undefined ? { pageSize: query.pageSize } : {}),
      });
      return reply.header('Cache-Control', sitemapCacheControl).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/collections', async (_request, reply) => {
    try {
      const result = await useCases.listPublicCollections.execute();
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/collections/:slug', async (request, reply) => {
    try {
      const { slug } = CollectionSlugParamsSchema.parse(request.params);
      const query = GetCuratedCollectionQuerySchema.parse(request.query);
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 24;
      const result = await useCases.getCuratedCollection.execute(slug, { page, pageSize });
      if (!result) return reply.status(404).send({ error: 'Collection not found' });
      const priceOptions = await resolvePublicPriceOptions();
      const products = await mapProductsToListItemDtos(
        result.products,
        loadProductCategory,
        priceOptions,
      );
      const dto = toCuratedCollectionDto(result.collection, products, {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
      return reply.send(dto);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/coupons', async (_request, reply) => {
    try {
      const coupons = await useCases.listActiveCoupons.execute();
      return reply.send({ items: coupons });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.get('/comparisons/:identifier', async (request, reply) => {
    try {
      const { identifier } = ComparisonIdentifierParamsSchema.parse(request.params);
      const result = await useCases.getComparisonByIdentifier.execute(identifier);
      if (!result) return reply.status(404).send({ error: 'Comparison not found' });

      const categoryIds = new Set<string>();
      for (const product of [...result.products, ...result.relatedProducts]) {
        if (product.categoryId) categoryIds.add(product.categoryId);
      }
      const categoriesById = new Map<string, { id: string; slug: string; label: string }>();
      for (const categoryId of categoryIds) {
        const category = await container.repositories.categoryRepository.findById(categoryId);
        if (category) {
          categoriesById.set(categoryId, {
            id: category.id,
            slug: category.slug,
            label: category.label,
          });
        }
      }

      return reply.send(
        toComparisonPublicDto(result, categoriesById, await resolvePublicPriceOptions()),
      );
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/comparisons', async (request, reply) => {
    try {
      const sessionId = getSessionId(request);
      const body = CreateComparisonSchema.parse(request.body);
      const result = await useCases.createComparison.execute({
        sessionId,
        productIds: body.productIds,
        editorialIntro: body.editorialIntro,
        shareToken: randomUUID(),
      });
      const statusCode = result.created ? 201 : 200;
      return reply.status(statusCode).send({
        shareToken: result.shareToken,
        id: result.id,
      });
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/events/click', async (request, reply) => {
    try {
      const body = RecordClickSchema.parse(request.body);
      await useCases.recordClickEvent.execute(body);
      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply);
    }
  });

  app.post('/events/engagement', async (request, reply) => {
    try {
      const body = RecordEngagementSchema.parse(request.body);
      const headerSessionId = request.headers['x-session-id'];
      const sessionId =
        body.sessionId ??
        (typeof headerSessionId === 'string' && headerSessionId.length > 0
          ? headerSessionId
          : undefined);

      void useCases.recordEngagementEvent
        .execute({
          eventType: body.eventType,
          articleId: body.articleId,
          pagePath: body.pagePath,
          ...(body.placement !== undefined ? { placement: body.placement } : {}),
          ...(body.blockId !== undefined ? { blockId: body.blockId } : {}),
          ...(body.referrerPath !== undefined ? { referrerPath: body.referrerPath } : {}),
          ...(sessionId !== undefined ? { sessionId } : {}),
        })
        .catch((error: unknown) => {
          container.logger.error('Telemetry failed for engagement event', {
            eventType: body.eventType,
            articleId: body.articleId,
            error: error instanceof Error ? error.message : String(error),
          });
        });

      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply);
    }
  });

  registerInstitutionalRoutes(app, container);
  registerPublicSiteSettingsRoute(app, container);
  registerAdminRoutes(app, container);
}
