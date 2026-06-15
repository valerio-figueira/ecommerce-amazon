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
  autoLinkIdParamsSchema,
  createAutoLinkBodySchema,
  listAutoLinksQuerySchema,
  searchInternalLinkTargetsQuerySchema,
  updateAutoLinkBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminAutoLinkError(error: unknown, reply: FastifyReply) {
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

export function registerAdminAutoLinkRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): void {
  const { useCases } = container;

  app.get('/admin/internal-link-targets', async (request, reply) => {
    try {
      const query = searchInternalLinkTargetsQuerySchema.parse(request.query);
      const result = await useCases.searchInternalLinkTargets.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAutoLinkError(error, reply);
    }
  });

  app.get('/admin/auto-links', async (request, reply) => {
    try {
      const query = listAutoLinksQuerySchema.parse(request.query);
      const result = await useCases.listAutoLinksAdmin.execute(query);
      return reply.send(result);
    } catch (error) {
      return handleAdminAutoLinkError(error, reply);
    }
  });

  app.post('/admin/auto-links', async (request, reply) => {
    try {
      const body = createAutoLinkBodySchema.parse(request.body);
      const result = await useCases.createAutoLink.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleAdminAutoLinkError(error, reply);
    }
  });

  app.patch('/admin/auto-links/:id', async (request, reply) => {
    try {
      const { id } = autoLinkIdParamsSchema.parse(request.params);
      const body = updateAutoLinkBodySchema.parse(request.body);
      await useCases.updateAutoLink.execute(id, body);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminAutoLinkError(error, reply);
    }
  });

  app.delete('/admin/auto-links/:id', async (request, reply) => {
    try {
      const { id } = autoLinkIdParamsSchema.parse(request.params);
      await useCases.deleteAutoLink.execute(id);
      return reply.status(204).send();
    } catch (error) {
      return handleAdminAutoLinkError(error, reply);
    }
  });
}
