import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import path from 'node:path';

import { buildApiContainer } from '@ecommerce-amazon/infrastructure';
import { createCorsOriginDelegate, parseCorsOrigins } from '@ecommerce-amazon/shared';
import { AVATAR_MAX_BYTES } from '@ecommerce-amazon/application';

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

  await app.register(multipart, {
    limits: {
      fileSize: AVATAR_MAX_BYTES,
      files: 1,
    },
  });

  if (container.env.STORAGE_DRIVER === 'filesystem') {
    const root = path.resolve(container.env.STORAGE_LOCAL_ROOT);
    await app.register(fastifyStatic, {
      root,
      prefix: '/uploads/',
      decorateReply: false,
    });
  }

  await registerRoutes(app, container);

  return { app, container };
}
