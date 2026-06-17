import type { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  AuthenticationError,
  DomainError,
  ValidationError,
} from '@ecommerce-amazon/domain';

const INFRASTRUCTURE_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'EAI_AGAIN',
]);

export function isInfrastructureError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;
  if (typeof code === 'string' && INFRASTRUCTURE_ERROR_CODES.has(code)) {
    return true;
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause instanceof Error) {
    return isInfrastructureError(cause);
  }

  return false;
}

export function handleAdminError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof AuthenticationError) {
    return reply.status(401).send({ error: error.message, code: error.code });
  }
  if (error instanceof ValidationError || error instanceof DomainError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (isInfrastructureError(error)) {
    return reply.status(503).send({
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: 'Internal server error' });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}
