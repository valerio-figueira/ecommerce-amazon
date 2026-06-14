import { randomUUID } from 'node:crypto';

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { DomainError, parseMarketplace, parseProductSortField, ValidationError, type Marketplace } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

import { registerAdminRoutes } from './admin-routes.js';
import {
  toProductDetailDto,
  toProductListItemDto,
  toCuratedCollectionDto,
} from '../../presenters/product.presenter.js';
import { toProductCategorySummaryDto } from '../../presenters/category.presenter.js';
import { toArticlePublicDetailDto } from '../../presenters/article.presenter.js';
import {
  ArticleSlugParamsSchema,
  BatchCheckoutSchema,
  CollectionSlugParamsSchema,
  ComparisonTokenParamsSchema,
  ConfirmPriceAlertParamsSchema,
  CreateComparisonSchema,
  CreatePriceAlertSchema,
  GoQuerySchema,
  GoSlugParamsSchema,
  ListProductsQuerySchema,
  PageSlugParamsSchema,
  ProductIdParamsSchema,
  ProductSlugParamsSchema,
  CategorySlugParamsSchema,
  RecordClickSchema,
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

export async function registerRoutes(app: FastifyInstance, container: ApiContainer) {
  const { useCases } = container;

  app.get('/health', async () => ({ status: 'ok' }));

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
        ...(query.utm_source !== undefined ? { utmSource: query.utm_source } : {}),
        ...(query.utm_medium !== undefined ? { utmMedium: query.utm_medium } : {}),
        ...(query.utm_campaign !== undefined ? { utmCampaign: query.utm_campaign } : {}),
      });

      if (!result.ok) {
        return reply.redirect('/', 307);
      }

      void useCases.recordClickEvent
        .execute({
          productId: result.value.productId,
          origin: 'redirect_go',
          ...(query.blockId !== undefined ? { blockId: query.blockId } : {}),
          ...(sessionId !== undefined ? { sessionId } : {}),
        })
        .catch((error: unknown) => {
          container.logger.error('Telemetry failed for /go redirect', {
            slug,
            error: error instanceof Error ? error.message : String(error),
          });
        });

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
      const result = await useCases.listProducts.execute(filters);
      return reply.send({
        items: result.items.map(toProductListItemDto),
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
      const product = await useCases.getProductBySlug.execute(slug);
      if (!product) return reply.status(404).send({ error: 'Product not found' });

      const dto = toProductDetailDto(product);
      if (product.categoryId) {
        const category = await container.repositories.categoryRepository.findById(
          product.categoryId,
        );
        if (category) {
          const ancestors = await container.repositories.categoryRepository.getAncestorChain(
            category.id,
          );
          return reply.send({
            ...dto,
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

  app.get('/articles/:slug', async (request, reply) => {
    try {
      const { slug } = ArticleSlugParamsSchema.parse(request.params);
      const result = await useCases.getArticleWithEmbeds.execute(slug);
      if (!result) return reply.status(404).send({ error: 'Article not found' });
      return reply.send(toArticlePublicDetailDto(result));
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
      const result = await useCases.getCuratedCollection.execute(slug);
      if (!result) return reply.status(404).send({ error: 'Collection not found' });
      return reply.send(toCuratedCollectionDto(result.collection, result.products));
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

  app.get('/comparisons/:shareToken', async (request, reply) => {
    try {
      const { shareToken } = ComparisonTokenParamsSchema.parse(request.params);
      const result = await useCases.getComparisonByToken.execute(shareToken);
      if (!result) return reply.status(404).send({ error: 'Comparison not found' });
      return reply.send(result);
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
      return reply.status(201).send(result);
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

  await registerAdminRoutes(app, container);
}
