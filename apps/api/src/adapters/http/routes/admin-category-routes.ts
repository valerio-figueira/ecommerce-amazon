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
  categoryIdParamsSchema,
  createCategoryBodySchema,
  reorderCategoriesBodySchema,
  updateCategoryBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminCategoryError(error: unknown, reply: FastifyReply) {
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

export function registerAdminCategoryRoutes(app: FastifyInstance, container: ApiContainer): void {
  const { useCases } = container;

  app.get('/admin/categories', async (_request, reply) => {
    try {
      const result = await useCases.listAdminCategories.execute();
      return reply.send(result);
    } catch (error) {
      return handleAdminCategoryError(error, reply);
    }
  });

  app.post('/admin/categories', async (request, reply) => {
    try {
      const body = createCategoryBodySchema.parse(request.body);
      const result = await useCases.createCategory.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminCategoryError(error, reply);
    }
  });

  app.patch('/admin/categories/reorder', async (request, reply) => {
    try {
      const body = reorderCategoriesBodySchema.parse(request.body);
      await useCases.reorderCategories.execute(body.items);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminCategoryError(error, reply);
    }
  });

  app.patch('/admin/categories/:id', async (request, reply) => {
    try {
      const { id } = categoryIdParamsSchema.parse(request.params);
      const body = updateCategoryBodySchema.parse(request.body);
      await useCases.updateCategory.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminCategoryError(error, reply);
    }
  });

  app.delete('/admin/categories/:id', async (request, reply) => {
    try {
      const { id } = categoryIdParamsSchema.parse(request.params);
      await useCases.deleteCategory.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminCategoryError(error, reply);
    }
  });
}
