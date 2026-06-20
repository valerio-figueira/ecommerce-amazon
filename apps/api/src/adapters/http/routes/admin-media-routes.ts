import type { FastifyInstance, FastifyReply } from 'fastify';

import { DomainError, ValidationError } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

function handleAdminMediaError(error: unknown, reply: FastifyReply) {
  if (error instanceof ValidationError || error instanceof DomainError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

export function registerAdminMediaRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): void {
  const { useCases } = container;

  app.post('/admin/media/images', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const file = await request.file();
      if (!file) {
        return reply
          .status(400)
          .send({ error: 'Arquivo de imagem ausente.', code: 'VALIDATION_ERROR' });
      }

      const buffer = await file.toBuffer();
      const mime = file.mimetype || 'application/octet-stream';

      const result = await useCases.uploadAdminImage.execute({ buffer, mime });
      return reply.send(result);
    } catch (error) {
      return handleAdminMediaError(error, reply);
    }
  });
}
