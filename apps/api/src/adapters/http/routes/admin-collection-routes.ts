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
  collectionIdParamsSchema,
  createCollectionBodySchema,
  updateCollectionBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminCollectionError(error: unknown, reply: FastifyReply) {
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

export async function registerAdminCollectionRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/collections', async (_request, reply) => {
    try {
      const result = await useCases.listCuratedCollections.execute();
      return reply.send(result);
    } catch (error) {
      return handleAdminCollectionError(error, reply);
    }
  });

  app.get('/admin/collections/:id', async (request, reply) => {
    try {
      const { id } = collectionIdParamsSchema.parse(request.params);
      const result = await useCases.getAdminCollection.execute(id);
      if (!result) {
        return reply.status(404).send({ error: 'Collection not found' });
      }
      return reply.send(result);
    } catch (error) {
      return handleAdminCollectionError(error, reply);
    }
  });

  app.post('/admin/collections', async (request, reply) => {
    try {
      const body = createCollectionBodySchema.parse(request.body);
      const result = await useCases.createCuratedCollection.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminCollectionError(error, reply);
    }
  });

  app.patch('/admin/collections/:id', async (request, reply) => {
    try {
      const { id } = collectionIdParamsSchema.parse(request.params);
      const body = updateCollectionBodySchema.parse(request.body);
      await useCases.updateCuratedCollection.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminCollectionError(error, reply);
    }
  });

  app.delete('/admin/collections/:id', async (request, reply) => {
    try {
      const { id } = collectionIdParamsSchema.parse(request.params);
      await useCases.deleteCuratedCollection.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminCollectionError(error, reply);
    }
  });
}
