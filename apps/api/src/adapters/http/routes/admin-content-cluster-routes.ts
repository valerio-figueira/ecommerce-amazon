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
  contentClusterIdParamsSchema,
  createContentClusterBodySchema,
  updateContentClusterBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminContentClusterError(error: unknown, reply: FastifyReply) {
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

export function registerAdminContentClusterRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): void {
  const { useCases } = container;

  app.get('/admin/content-clusters', async (_request, reply) => {
    try {
      const result = await useCases.listContentClustersAdmin.execute();
      return reply.send(result);
    } catch (error) {
      return handleAdminContentClusterError(error, reply);
    }
  });

  app.post('/admin/content-clusters', async (request, reply) => {
    try {
      const body = createContentClusterBodySchema.parse(request.body);
      const result = await useCases.createContentCluster.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminContentClusterError(error, reply);
    }
  });

  app.get('/admin/content-clusters/:id', async (request, reply) => {
    try {
      const { id } = contentClusterIdParamsSchema.parse(request.params);
      const result = await useCases.getContentClusterAdmin.execute(id);
      if (!result) {
        return reply.status(404).send({ error: 'Content cluster not found' });
      }
      return reply.send(result);
    } catch (error) {
      return handleAdminContentClusterError(error, reply);
    }
  });

  app.patch('/admin/content-clusters/:id', async (request, reply) => {
    try {
      const { id } = contentClusterIdParamsSchema.parse(request.params);
      const body = updateContentClusterBodySchema.parse(request.body);
      await useCases.updateContentCluster.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminContentClusterError(error, reply);
    }
  });

  app.delete('/admin/content-clusters/:id', async (request, reply) => {
    try {
      const { id } = contentClusterIdParamsSchema.parse(request.params);
      await useCases.deleteContentCluster.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminContentClusterError(error, reply);
    }
  });
}
