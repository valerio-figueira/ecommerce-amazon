import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { EntityNotFoundError, PageStatus } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import { getBrandConfig, loadEnv } from '@ecommerce-amazon/shared';
import {
  isInstitutionalPageSlug,
  parseAdminInstitutionalPageResponse,
  parseInstitutionalPageContent,
  parseInstitutionalPageResponse,
  parseUpdateInstitutionalPageBody,
} from '@ecommerce-amazon/shared/institutional';

import { PageSlugParamsSchema } from '../../dtos/request/schemas.js';

function handleInstitutionalError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof EntityNotFoundError) {
    return reply.status(404).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

function parsePageStatus(status: 'draft' | 'published'): PageStatus {
  return status === 'published' ? PageStatus.PUBLISHED : PageStatus.DRAFT;
}

export function registerInstitutionalRoutes(app: FastifyInstance, container: ApiContainer): void {
  const { useCases } = container;
  const brand = getBrandConfig(loadEnv());

  app.get('/institutional-pages/:slug', async (request, reply) => {
    try {
      const { slug } = PageSlugParamsSchema.parse(request.params);
      if (!isInstitutionalPageSlug(slug)) {
        return reply.status(404).send({ error: 'Institutional page not found' });
      }

      const result = await useCases.getPublishedInstitutionalPage.execute(slug, brand);
      if (!result) {
        return reply.status(404).send({ error: 'Institutional page not found' });
      }
      return reply.send(parseInstitutionalPageResponse(slug, result));
    } catch (error) {
      return handleInstitutionalError(error, reply);
    }
  });

  app.get('/team', async (_request, reply) => {
    try {
      const result = await useCases.getPublicTeamMembers.execute();
      return reply.send(result);
    } catch (error) {
      return handleInstitutionalError(error, reply);
    }
  });
}

export function registerAdminInstitutionalRoutes(
  app: FastifyInstance,
  container: ApiContainer,
): void {
  const { useCases } = container;
  const brand = getBrandConfig(loadEnv());

  app.get('/admin/institutional-pages/:slug', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const { slug } = PageSlugParamsSchema.parse(request.params);
      if (!isInstitutionalPageSlug(slug)) {
        return reply.status(404).send({ error: 'Institutional page not found' });
      }

      const result = await useCases.getAdminInstitutionalPage.execute(slug, brand);
      if (!result) {
        return reply.status(404).send({ error: 'Institutional page not found' });
      }
      return reply.send(result);
    } catch (error) {
      return handleInstitutionalError(error, reply);
    }
  });

  app.patch('/admin/institutional-pages/:slug', async (request, reply) => {
    try {
      const operatorId = request.adminOperator?.id;
      if (!operatorId) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      const { slug } = PageSlugParamsSchema.parse(request.params);
      if (!isInstitutionalPageSlug(slug)) {
        return reply.status(404).send({ error: 'Institutional page not found' });
      }

      const body = parseUpdateInstitutionalPageBody(slug, request.body);
      const content = parseInstitutionalPageContent(slug, body.content);

      const result = await useCases.updateInstitutionalPage.execute({
        slug,
        content,
        ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
        ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
        ...(body.status !== undefined ? { status: parsePageStatus(body.status) } : {}),
      });

      return reply.send(parseAdminInstitutionalPageResponse(slug, result));
    } catch (error) {
      return handleInstitutionalError(error, reply);
    }
  });
}
