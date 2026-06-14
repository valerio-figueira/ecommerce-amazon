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
  articleCategoryIdParamsSchema,
  createArticleCategoryBodySchema,
  updateArticleCategoryBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminArticleCategoryError(error: unknown, reply: FastifyReply) {
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

export async function registerAdminArticleCategoryRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/article-categories', async (_request, reply) => {
    try {
      const result = await useCases.listArticleCategories.execute();
      return reply.send(result);
    } catch (error) {
      return handleAdminArticleCategoryError(error, reply);
    }
  });

  app.post('/admin/article-categories', async (request, reply) => {
    try {
      const body = createArticleCategoryBodySchema.parse(request.body);
      const result = await useCases.createArticleCategory.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminArticleCategoryError(error, reply);
    }
  });

  app.patch('/admin/article-categories/:id', async (request, reply) => {
    try {
      const { id } = articleCategoryIdParamsSchema.parse(request.params);
      const body = updateArticleCategoryBodySchema.parse(request.body);
      await useCases.updateArticleCategory.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminArticleCategoryError(error, reply);
    }
  });

  app.delete('/admin/article-categories/:id', async (request, reply) => {
    try {
      const { id } = articleCategoryIdParamsSchema.parse(request.params);
      await useCases.deleteArticleCategory.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminArticleCategoryError(error, reply);
    }
  });
}
