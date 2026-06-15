import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  ConflictError,
  DomainError,
  EntityNotFoundError,
  ValidationError,
  parseMarketplace,
  parseProductSortField,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import {
  adminListProductsQuerySchema,
  adminProductSlugParamsSchema,
  createProductBodySchema,
  updateProductBodySchema,
} from '@ecommerce-amazon/shared/admin';

import {
  toAdminProductDetailDto,
  toAdminProductListResponseDto,
} from '../../presenters/product.presenter.js';

function handleAdminProductError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof ConflictError) {
    return reply.status(409).send({ error: error.message, code: error.code });
  }
  if (error instanceof EntityNotFoundError) {
    return reply.status(404).send({ error: error.message, code: error.code });
  }
  if (error instanceof ValidationError || error instanceof DomainError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

export async function registerAdminProductRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/products', async (request, reply) => {
    try {
      const query = adminListProductsQuerySchema.parse(request.query);
      const filters: Parameters<typeof useCases.listAdminProducts.execute>[0] = {};
      if (query.page !== undefined) filters.page = query.page;
      if (query.pageSize !== undefined) filters.pageSize = query.pageSize;
      if (query.marketplace !== undefined) {
        filters.marketplace = parseMarketplace(query.marketplace);
      }
      if (query.sort !== undefined) {
        filters.sort = parseProductSortField(query.sort);
      }
      if (query.search !== undefined && query.search.length > 0) {
        filters.search = query.search;
      }
      const result = await useCases.listAdminProducts.execute(filters);
      return reply.send(toAdminProductListResponseDto(result));
    } catch (error) {
      return handleAdminProductError(error, reply);
    }
  });

  app.post('/admin/products', async (request, reply) => {
    try {
      const body = createProductBodySchema.parse(request.body);
      const result = await useCases.createProduct.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminProductError(error, reply);
    }
  });

  app.get('/admin/products/:slug', async (request, reply) => {
    try {
      const params = adminProductSlugParamsSchema.parse(request.params);
      const product = await useCases.getAdminProduct.execute({ slug: params.slug });
      return reply.send(toAdminProductDetailDto(product));
    } catch (error) {
      return handleAdminProductError(error, reply);
    }
  });

  app.patch('/admin/products/:slug', async (request, reply) => {
    try {
      const params = adminProductSlugParamsSchema.parse(request.params);
      const body = updateProductBodySchema.parse(request.body);
      const result = await useCases.updateProduct.execute(params.slug, body);
      return reply.send(result);
    } catch (error) {
      return handleAdminProductError(error, reply);
    }
  });
}
