import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import {
  AuthenticationError,
  DomainError,
  ValidationError,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

import { AdminLoginSchema } from '../../dtos/request/schemas.js';

function handleAdminError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof AuthenticationError) {
    return reply.status(401).send({ error: error.message, code: error.code });
  }
  if (error instanceof ValidationError || error instanceof DomainError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

export async function registerAdminRoutes(app: FastifyInstance, container: ApiContainer) {
  const { useCases, services } = container;

  app.post('/admin/auth/login', async (request, reply) => {
    try {
      const body = AdminLoginSchema.parse(request.body);
      const result = await useCases.authenticateOperator.execute(body);

      if (!result.ok) {
        return reply.status(401).send({ error: result.error.message, code: result.error.code });
      }

      return reply.send(result.value);
    } catch (error) {
      return handleAdminError(error, reply);
    }
  });

  app.post('/admin/auth/logout', async (_request, reply) => {
    return reply.status(204).send();
  });

  app.addHook('onRequest', async (request, reply) => {
    const url = request.url.split('?')[0] ?? request.url;
    if (!url.startsWith('/admin')) {
      return;
    }
    if (url === '/admin/auth/login' || url === '/admin/auth/logout') {
      return;
    }

    const token = getBearerToken(request);
    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    try {
      const payload = await services.authTokenService.verify(token);
      request.adminOperator = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
    }
  });

  app.get('/admin/auth/me', async (request, reply) => {
    if (!request.adminOperator) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    return reply.send(request.adminOperator);
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    adminOperator?: {
      id: string;
      email: string;
      name: string;
    };
  }
}
