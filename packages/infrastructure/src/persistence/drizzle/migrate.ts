import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { loadDotenvFromMonorepoRoot } from './load-env.js';

async function runMigrations(): Promise<void> {
  loadDotenvFromMonorepoRoot();

  const logger = createConsoleLogger();
  const env = loadEnv();
  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'migrations',
  );

  logger.info('Running database migrations', { migrationsFolder });

  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder });
    logger.info('Database migrations completed');
  } finally {
    await migrationClient.end();
  }
}

runMigrations().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Migration failed:', message);
  process.exit(1);
});
