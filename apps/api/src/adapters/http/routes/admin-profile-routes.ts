import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import {
  updateOperatorProfileBodySchema,
} from '@ecommerce-amazon/shared/admin';

function handleAdminProfileError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
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

export async function registerAdminProfileRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/profile', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const profile = await useCases.getOperatorProfile.execute(operatorId);
      return reply.send(profile);
    } catch (error) {
      return handleAdminProfileError(error, reply);
    }
  });

  app.patch('/admin/profile', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const body = updateOperatorProfileBodySchema.parse(request.body);
      const result = await useCases.updateOperatorProfile.execute({
        operatorId,
        name: body.name,
        bio: body.bio ?? null,
      });

      return reply.send(result);
    } catch (error) {
      return handleAdminProfileError(error, reply);
    }
  });

  app.post('/admin/profile/avatar', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const file = await request.file();
      if (!file) {
        return reply.status(400).send({ error: 'Arquivo de avatar ausente.', code: 'VALIDATION_ERROR' });
      }

      const buffer = await file.toBuffer();
      const mime = file.mimetype || 'application/octet-stream';

      const result = await useCases.uploadOperatorAvatar.execute({
        operatorId,
        buffer,
        mime,
      });

      return reply.send(result);
    } catch (error) {
      return handleAdminProfileError(error, reply);
    }
  });

  app.delete('/admin/profile/avatar', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const result = await useCases.removeOperatorAvatar.execute({ operatorId });
      return reply.send(result);
    } catch (error) {
      return handleAdminProfileError(error, reply);
    }
  });
}
