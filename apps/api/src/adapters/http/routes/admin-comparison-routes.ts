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
  comparisonIdParamsSchema,
  createAdminComparisonBodySchema,
  publishComparisonBodySchema,
  updateAdminComparisonBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminComparisonError(error: unknown, reply: FastifyReply) {
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

export function registerAdminComparisonRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): void {
  const { useCases } = container;

  app.get('/admin/comparisons', async (_request, reply) => {
    try {
      const result = await useCases.listAdminComparisons.execute();
      return reply.send(result);
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });

  app.get('/admin/comparisons/:id', async (request, reply) => {
    try {
      const { id } = comparisonIdParamsSchema.parse(request.params);
      const result = await useCases.getAdminComparison.execute(id);
      if (!result) {
        return reply.status(404).send({ error: 'Comparison not found' });
      }
      return reply.send(result);
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });

  app.post('/admin/comparisons', async (request, reply) => {
    try {
      const body = createAdminComparisonBodySchema.parse(request.body);
      const result = await useCases.createCuratedComparison.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });

  app.patch('/admin/comparisons/:id', async (request, reply) => {
    try {
      const { id } = comparisonIdParamsSchema.parse(request.params);
      const body = updateAdminComparisonBodySchema.parse(request.body);
      await useCases.updateComparison.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });

  app.post('/admin/comparisons/:id/publish', async (request, reply) => {
    try {
      const { id } = comparisonIdParamsSchema.parse(request.params);
      const body = publishComparisonBodySchema.parse(request.body);
      await useCases.publishComparison.execute(id, body.slug);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });

  app.delete('/admin/comparisons/:id', async (request, reply) => {
    try {
      const { id } = comparisonIdParamsSchema.parse(request.params);
      await useCases.deleteComparison.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminComparisonError(error, reply);
    }
  });
}
