import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { BlockVisibility, EntityNotFoundError, ValidationError } from '@ecommerce-amazon/domain';
import type { ApiContainer } from '@ecommerce-amazon/infrastructure';
import type { PageBlockDto } from '@ecommerce-amazon/shared/cms';

import {
  AdminPageBlockParamsSchema,
  AdminPageSlugParamsSchema,
  CreatePageBlockSchema,
  ReorderPageBlocksSchema,
  UpdatePageBlockSchema,
} from '../../dtos/request/schemas.js';

function handleCmsError(error: unknown, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'Validation failed', details: error.flatten() });
  }
  if (error instanceof EntityNotFoundError) {
    return reply.status(404).send({ error: error.message, code: error.code });
  }
  if (error instanceof ValidationError) {
    return reply.status(400).send({ error: error.message, code: error.code });
  }
  if (error instanceof Error) {
    return reply.status(500).send({ error: error.message });
  }
  return reply.status(500).send({ error: 'Internal server error' });
}

function parseVisibility(
  value: 'all' | 'desktop' | 'mobile' | undefined,
): BlockVisibility | undefined {
  if (value === undefined) return undefined;
  switch (value) {
    case 'desktop':
      return BlockVisibility.DESKTOP;
    case 'mobile':
      return BlockVisibility.MOBILE;
    case 'all':
    default:
      return BlockVisibility.ALL;
  }
}

async function findBlockDto(
  container: ApiContainer,
  slug: string,
  blockId: string,
): Promise<PageBlockDto | null> {
  const layout = await container.useCases.getAdminPageLayout.execute({ slug });
  if (!layout.ok) return null;
  return layout.value.blocks.find((block) => block.id === blockId) ?? null;
}

export function registerAdminCmsRoutes(app: FastifyInstance, container: ApiContainer) {
  const { useCases } = container;

  app.get('/admin/pages', async (_request, reply) => {
    try {
      const result = await useCases.listAdminPages.execute();
      if (!result.ok) {
        return reply.status(500).send({ error: 'Failed to list pages' });
      }
      return reply.send(result.value);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });

  app.get('/admin/pages/:slug', async (request, reply) => {
    try {
      const params = AdminPageSlugParamsSchema.parse(request.params);
      const result = await useCases.getAdminPageLayout.execute({ slug: params.slug });
      if (!result.ok) {
        return reply.status(404).send({ error: result.error.message, code: result.error.code });
      }
      return reply.send(result.value);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });

  app.post('/admin/pages/:slug/blocks', async (request, reply) => {
    try {
      const params = AdminPageSlugParamsSchema.parse(request.params);
      const body = CreatePageBlockSchema.parse(request.body);
      const page = await container.repositories.pageRepository.findPageBySlug(params.slug);
      if (!page) {
        return reply.status(404).send({ error: 'Page not found', code: 'ENTITY_NOT_FOUND' });
      }

      const result = await useCases.savePageBlock.execute({
        pageId: page.layout.id,
        type: body.type,
        position: body.position,
        props: body.props,
        visibility: parseVisibility(body.visibility),
      });

      if (!result.ok) {
        const status = result.error instanceof EntityNotFoundError ? 404 : 400;
        return reply.status(status).send({ error: result.error.message, code: result.error.code });
      }

      const block = await findBlockDto(container, params.slug, result.value.blockId);
      return reply.status(201).send(block);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });

  app.patch('/admin/pages/:slug/blocks/reorder', async (request, reply) => {
    try {
      const params = AdminPageSlugParamsSchema.parse(request.params);
      const body = ReorderPageBlocksSchema.parse(request.body);
      const page = await container.repositories.pageRepository.findPageBySlug(params.slug);
      if (!page) {
        return reply.status(404).send({ error: 'Page not found', code: 'ENTITY_NOT_FOUND' });
      }

      const result = await useCases.updatePageBlocksOrder.execute({
        pageId: page.layout.id,
        blocksOrder: body.blocksOrder,
      });

      if (!result.ok) {
        const status = result.error instanceof EntityNotFoundError ? 404 : 400;
        return reply.status(status).send({ error: result.error.message, code: result.error.code });
      }

      const layout = await useCases.getAdminPageLayout.execute({ slug: params.slug });
      return reply.send(layout.ok ? layout.value.blocks : []);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });

  app.patch('/admin/pages/:slug/blocks/:id', async (request, reply) => {
    try {
      const params = AdminPageBlockParamsSchema.parse(request.params);
      const body = UpdatePageBlockSchema.parse(request.body);
      const page = await container.repositories.pageRepository.findPageBySlug(params.slug);
      if (!page) {
        return reply.status(404).send({ error: 'Page not found', code: 'ENTITY_NOT_FOUND' });
      }

      const existing = page.blocks.find((block) => block.id === params.id);
      if (!existing) {
        return reply.status(404).send({ error: 'Block not found', code: 'ENTITY_NOT_FOUND' });
      }

      const result = await useCases.savePageBlock.execute({
        pageId: page.layout.id,
        blockId: params.id,
        type: body.type ?? existing.type,
        position: body.position ?? existing.sortOrder,
        props: body.props ?? existing.props,
        visibility: parseVisibility(body.visibility),
      });

      if (!result.ok) {
        const status = result.error instanceof EntityNotFoundError ? 404 : 400;
        return reply.status(status).send({ error: result.error.message, code: result.error.code });
      }

      const block = await findBlockDto(container, params.slug, params.id);
      return reply.send(block);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });

  app.delete('/admin/pages/:slug/blocks/:id', async (request, reply) => {
    try {
      const params = AdminPageBlockParamsSchema.parse(request.params);
      const page = await container.repositories.pageRepository.findPageBySlug(params.slug);
      if (!page) {
        return reply.status(404).send({ error: 'Page not found', code: 'ENTITY_NOT_FOUND' });
      }

      const existing = page.blocks.find((block) => block.id === params.id);
      if (!existing) {
        return reply.status(404).send({ error: 'Block not found', code: 'ENTITY_NOT_FOUND' });
      }

      const result = await useCases.deletePageBlock.execute({ blockId: params.id });
      if (!result.ok) {
        return reply.status(404).send({ error: result.error.message, code: result.error.code });
      }

      const layout = await useCases.getAdminPageLayout.execute({ slug: params.slug });
      return reply.send(layout.ok ? layout.value.blocks : []);
    } catch (error) {
      return handleCmsError(error, reply);
    }
  });
}
