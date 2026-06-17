import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import {
  AuthenticationError,
  DomainError,
  EntityNotFoundError,
  ValidationError,
} from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import {
  affiliateAccountsListResponseSchema,
  changeOperatorPasswordBodySchema,
  createAffiliateAccountBodySchema,
  createOperatorBodySchema,
  operationalStatusResponseSchema,
  operatorsListResponseSchema,
  siteSettingsResponseSchema,
  updateAffiliateAccountBodySchema,
  updateOperatorAccessBodySchema,
  updateSiteSettingsBodySchema,
} from '@ecommerce-amazon/shared/admin';

import { handleAdminError } from '../admin-error-handler.js';
import {
  handleAdminAuthorizationError,
  requireAdminOperator,
} from '../require-admin-operator.js';

function handleSettingsError(error: unknown, reply: FastifyReply) {
  const authResponse = handleAdminAuthorizationError(error, reply);
  if (authResponse) return authResponse;

  if (error instanceof EntityNotFoundError) {
    return reply.status(404).send({ error: error.message, code: error.code });
  }

  return handleAdminError(error, reply);
}

export async function registerAdminSettingsRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/admin/affiliate-accounts', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const result = await useCases.listAffiliateAccounts.execute();
      return reply.send(affiliateAccountsListResponseSchema.parse(result));
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.post('/admin/affiliate-accounts', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const body = createAffiliateAccountBodySchema.parse(request.body);
      const result = await useCases.createAffiliateAccount.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.patch('/admin/affiliate-accounts/:id', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const operatorId = request.adminOperator?.id;
      const operatorEmail = request.adminOperator?.email;
      if (!operatorId || !operatorEmail) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const params = request.params as { id: string };
      const body = updateAffiliateAccountBodySchema.parse(request.body);
      const result = await useCases.updateAffiliateAccount.execute({
        accountId: params.id,
        operatorEmail,
        ...body,
      });

      return reply.send(result);
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.delete('/admin/affiliate-accounts/:id', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const params = request.params as { id: string };
      const result = await useCases.deleteAffiliateAccount.execute({
        accountId: params.id,
      });
      return reply.send(result);
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.get('/admin/operators', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const result = await useCases.listOperators.execute();
      return reply.send(operatorsListResponseSchema.parse(result));
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.post('/admin/operators', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const body = createOperatorBodySchema.parse(request.body);
      const result = await useCases.createOperator.execute(body);
      return reply.status(201).send(result);
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.patch('/admin/operators/:id', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const actorId = request.adminOperator?.id;
      if (!actorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const params = request.params as { id: string };
      const body = updateOperatorAccessBodySchema.parse(request.body);
      const result = await useCases.updateOperatorAccess.execute({
        operatorId: params.id,
        actorId,
        ...body,
      });

      return reply.send(result);
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.patch('/admin/profile/password', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const body = changeOperatorPasswordBodySchema.parse(request.body);
      const result = await useCases.changeOperatorPassword.execute({
        operatorId,
        ...body,
      });

      return reply.send(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
      }
      if (error instanceof AuthenticationError) {
        return reply.status(401).send({ error: 'Senha atual inválida', code: error.code });
      }
      return handleSettingsError(error, reply);
    }
  });

  app.get('/admin/site-settings', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const result = await useCases.getSiteSettings.execute();
      return reply.send(siteSettingsResponseSchema.parse(result));
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.patch('/admin/site-settings', async (request, reply) => {
    try {
      await requireAdminOperator(request, container);
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const body = updateSiteSettingsBodySchema.parse(request.body);
      const result = await useCases.updateSiteSettings.execute({
        patch: body,
        updatedBy: operatorId,
      });

      return reply.send(siteSettingsResponseSchema.parse(result));
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });

  app.get('/admin/operational-status', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const result = await useCases.getOperationalStatus.execute();
      return reply.send(operationalStatusResponseSchema.parse(result));
    } catch (error) {
      return handleSettingsError(error, reply);
    }
  });
}

export async function registerPublicSiteSettingsRoute(
  app: FastifyInstance,
  container: ApiContainer,
): Promise<void> {
  const { useCases } = container;

  app.get('/site-settings/public', async (_request, reply) => {
    try {
      const result = await useCases.getPublicSiteSettings.execute();
      return reply.send(result);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DomainError) {
        return reply.status(400).send({ error: error.message, code: error.code });
      }
      if (error instanceof Error) {
        return reply.status(500).send({ error: error.message });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
