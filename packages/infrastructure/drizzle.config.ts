import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

import { buildDatabaseUrl } from '@ecommerce-amazon/shared';

config({ path: path.resolve(import.meta.dirname, '../../.env') });

const databaseUrl =
  process.env['DATABASE_URL'] ??
  buildDatabaseUrl({
    POSTGRES_HOST: process.env['POSTGRES_HOST'] ?? 'localhost',
    POSTGRES_PORT: Number(process.env['POSTGRES_PORT'] ?? 5432),
    POSTGRES_USER: process.env['POSTGRES_USER'] ?? 'vitrine',
    POSTGRES_PASSWORD: process.env['POSTGRES_PASSWORD'] ?? 'vitrine',
    POSTGRES_DB: process.env['POSTGRES_DB'] ?? 'vitrine',
  });

export default defineConfig({
  schema: './src/persistence/drizzle/schema/index.ts',
  out: './src/persistence/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
