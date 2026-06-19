import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  ConflictError,
  DomainError,
  EntityNotFoundError,
  ValidationError,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import {
  articleIdParamsSchema,
  adminListArticlesQuerySchema,
  createArticleBodySchema,
  updateArticleBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminArticleError(error: unknown, reply: FastifyReply) {
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

export async function registerAdminArticleRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/articles', async (request, reply) => {
    try {
      const query = request.query as { picker?: string };
      if (query.picker === 'true') {
        const result = await useCases.listAdminArticles.executePublishedPicker();
        return reply.send(result);
      }

      const parsed = adminListArticlesQuerySchema.parse(request.query);
      const filters: Parameters<typeof useCases.listAdminArticles.execute>[0] = {};
      if (parsed.page !== undefined) filters.page = parsed.page;
      if (parsed.pageSize !== undefined) filters.pageSize = parsed.pageSize;
      if (parsed.search !== undefined && parsed.search.length > 0) {
        filters.search = parsed.search;
      }
      if (parsed.status !== undefined) {
        filters.status = parsed.status;
      }
      const result = await useCases.listAdminArticles.execute(filters);
      return reply.send(result);
    } catch (error) {
      return handleAdminArticleError(error, reply);
    }
  });

  app.get('/admin/articles/:id', async (request, reply) => {
    try {
      const { id } = articleIdParamsSchema.parse(request.params);
      const result = await useCases.getAdminArticle.execute(id);
      if (!result) {
        return reply.status(404).send({ error: 'Article not found' });
      }
      return reply.send(result);
    } catch (error) {
      return handleAdminArticleError(error, reply);
    }
  });

  app.post('/admin/articles', async (request, reply) => {
    try {
      const body = createArticleBodySchema.parse(request.body);
      const authorId = request.adminOperator?.id;
      if (!authorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }
      const result = await useCases.createArticle.execute(body, authorId);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminArticleError(error, reply);
    }
  });

  app.patch('/admin/articles/:id', async (request, reply) => {
    try {
      const { id } = articleIdParamsSchema.parse(request.params);
      const body = updateArticleBodySchema.parse(request.body);
      await useCases.updateArticle.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminArticleError(error, reply);
    }
  });

  app.delete('/admin/articles/:id', async (request, reply) => {
    try {
      const { id } = articleIdParamsSchema.parse(request.params);
      await useCases.deleteArticle.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminArticleError(error, reply);
    }
  });
}
