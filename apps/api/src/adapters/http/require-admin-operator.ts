import type { FastifyReply, FastifyRequest } from 'fastify';

import { OperatorRole } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

export class AdminAuthorizationError extends Error {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Admin access required') {
    super(message);
    this.name = 'AdminAuthorizationError';
  }
}

export async function requireAdminOperator(
  request: FastifyRequest,
  container: ApiContainer,
): Promise<void> {
  const operatorId = request.adminOperator?.id;
  if (!operatorId) {
    throw new AdminAuthorizationError('Unauthorized');
  }

  const operator = await container.useCases.getOperatorProfile.execute(operatorId);
  if (operator.role !== OperatorRole.ADMIN) {
    throw new AdminAuthorizationError();
  }
}

export function handleAdminAuthorizationError(error: unknown, reply: FastifyReply) {
  if (error instanceof AdminAuthorizationError) {
    const status = error.message === 'Unauthorized' ? 401 : 403;
    return reply.status(status).send({
      error: error.message,
      code: error.code,
    });
  }

  return null;
}
