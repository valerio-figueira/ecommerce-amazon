import type { FastifyInstance, FastifyRequest } from 'fastify';

import type { ApiContainer } from '@ecommerce-amazon/infrastructure';

import { handleAdminError } from '../admin-error-handler.js';

import { registerAdminCmsRoutes } from './admin-cms-routes.js';
import { registerAdminCategoryRoutes } from './admin-category-routes.js';
import { registerAdminCollectionRoutes } from './admin-collection-routes.js';
import { registerAdminComparisonRoutes } from './admin-comparison-routes.js';
import { registerAdminProductRoutes } from './admin-product-routes.js';
import { registerAdminArticleRoutes } from './admin-article-routes.js';
import { registerAdminArticleCategoryRoutes } from './admin-article-category-routes.js';
import { registerAdminContentClusterRoutes } from './admin-content-cluster-routes.js';
import { registerAdminAutoLinkRoutes } from './admin-auto-link-routes.js';
import { registerAdminProfileRoutes } from './admin-profile-routes.js';
import { registerAdminMediaRoutes } from './admin-media-routes.js';
import { registerAdminAnalyticsRoutes } from './admin-analytics-routes.js';
import { registerAdminSettingsRoutes } from './admin-settings-routes.js';
import { registerAdminInstitutionalRoutes } from './institutional-routes.js';
import { AdminLoginSchema } from '../../dtos/request/schemas.js';
import { createLoginRateLimiter } from '../login-rate-limiter.js';

function getBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function getClientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() ?? request.ip;
  }
  return request.ip;
}

export function registerAdminRoutes(app: FastifyInstance, container: ApiContainer) {
  const { useCases, services } = container;
  const loginRateLimiter = createLoginRateLimiter();

  app.post('/admin/auth/login', async (request, reply) => {
    const clientIp = getClientIp(request);
    const rateLimit = loginRateLimiter.check(clientIp);
    if (!rateLimit.allowed) {
      return reply.status(429).header('Retry-After', String(rateLimit.retryAfterSeconds)).send({
        error: 'Too many login attempts. Try again later.',
        code: 'RATE_LIMITED',
      });
    }

    try {
      const body = AdminLoginSchema.parse(request.body);
      const result = await useCases.authenticateOperator.execute(body);

      if (!result.ok) {
        loginRateLimiter.recordFailure(clientIp);
        return reply.status(401).send({ error: result.error.message, code: result.error.code });
      }

      loginRateLimiter.reset(clientIp);
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

  app.get('/admin/auth/session', async (request, reply) => {
    const operatorId = request.adminOperator?.id;
    if (!operatorId) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    try {
      const result = await useCases.validateOperatorSession.execute(operatorId);

      if (!result.ok) {
        return reply.status(401).send({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
      }

      return reply.send(result.value);
    } catch (error) {
      return handleAdminError(error, reply);
    }
  });

  registerAdminCmsRoutes(app, container);
  registerAdminCategoryRoutes(app, container);
  registerAdminCollectionRoutes(app, container);
  registerAdminComparisonRoutes(app, container);
  registerAdminProductRoutes(app, container);
  registerAdminArticleRoutes(app, container);
  registerAdminArticleCategoryRoutes(app, container);
  registerAdminContentClusterRoutes(app, container);
  registerAdminAutoLinkRoutes(app, container);
  registerAdminProfileRoutes(app, container);
  registerAdminInstitutionalRoutes(app, container);
  registerAdminMediaRoutes(app, container);
  registerAdminAnalyticsRoutes(app, container);
  registerAdminSettingsRoutes(app, container);
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
