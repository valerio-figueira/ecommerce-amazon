import cors from '@fastify/cors';
import Fastify from 'fastify';

import { buildApiContainer } from '@ecommerce-amazon/infrastructure';
import { parseCorsOrigins } from '@ecommerce-amazon/shared';

import { registerRoutes } from './adapters/http/routes/index.js';

export async function buildServer() {
  const container = buildApiContainer();
  const app = Fastify({ logger: true });

  const allowedOrigins = parseCorsOrigins(container.env.CORS_ORIGINS);
  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    allowedHeaders: ['Content-Type', 'x-session-id'],
  });
  await registerRoutes(app, container);

  return { app, container };
}
