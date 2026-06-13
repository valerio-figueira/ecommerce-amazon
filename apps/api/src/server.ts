import cors from '@fastify/cors';
import Fastify from 'fastify';

import { buildApiContainer } from '@ecommerce-amazon/infrastructure';

import { registerRoutes } from './adapters/http/routes/index.js';

export async function buildServer() {
  const container = buildApiContainer();
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await registerRoutes(app, container);

  return { app, container };
}
