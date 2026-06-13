import cors from '@fastify/cors';
import Fastify from 'fastify';

import { buildApiContainer } from '@ecommerce-amazon/infrastructure';
import { createCorsOriginDelegate, parseCorsOrigins } from '@ecommerce-amazon/shared';

import { registerRoutes } from './adapters/http/routes/index.js';

export async function buildServer() {
  const container = buildApiContainer();
  const app = Fastify({ logger: true });

  const allowedOrigins = parseCorsOrigins(container.env.CORS_ORIGINS);
  await app.register(cors, {
    origin: createCorsOriginDelegate(
      allowedOrigins,
      container.env.NODE_ENV,
      container.env.WEB_PORT,
      container.env.ADMIN_PORT,
    ),
    allowedHeaders: ['Content-Type', 'x-session-id', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await registerRoutes(app, container);

  return { app, container };
}
