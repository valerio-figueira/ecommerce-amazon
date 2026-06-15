import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { DomainError, ValidationError } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import {
  analyticsDateRangeQuerySchema,
  analyticsTopLimitQuerySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminAnalyticsError(error: unknown, reply: FastifyReply) {
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

export async function registerAdminAnalyticsRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/analytics/overview', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClickAnalyticsOverview.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/by-origin', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksByOrigin.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/by-marketplace', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksByMarketplace.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/top-products', async (request, reply) => {
    try {
      const query = analyticsTopLimitQuerySchema.parse(request.query);
      const result = await useCases.getTopClickedProducts.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/articles/converting', async (request, reply) => {
    try {
      const query = analyticsTopLimitQuerySchema.parse(request.query);
      const result = await useCases.getConvertingArticles.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/traffic/acquisition', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getGa4TrafficAcquisition.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/ctr/by-origin', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getCtrByOrigin.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/by-placement', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksByPlacement.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/by-block', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksByBlock.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/by-page', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksByPage.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/clicks/trend-by-origin', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getClicksTrendByOrigin.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });

  app.get('/admin/analytics/engagement/funnel', async (request, reply) => {
    try {
      const query = analyticsDateRangeQuerySchema.parse(request.query);
      const result = await useCases.getEditorialFunnel.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAnalyticsError(error, reply);
    }
  });
}
