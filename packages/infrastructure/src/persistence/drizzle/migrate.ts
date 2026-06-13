import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { formatDatabaseConnectionError } from './connection-error.js';
import { loadDotenvFromMonorepoRoot } from './load-env.js';

async function assertDatabaseConnection(databaseUrl: string): Promise<void> {
  const client = postgres(databaseUrl, { max: 1 });
  try {
    await client`SELECT 1`;
  } finally {
    await client.end();
  }
}

async function runMigrations(): Promise<void> {
  loadDotenvFromMonorepoRoot();

  const logger = createConsoleLogger();
  const env = loadEnv();
  const migrationsFolder = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'migrations',
  );

  logger.info('Running database migrations', { migrationsFolder });

  try {
    await assertDatabaseConnection(env.DATABASE_URL);
  } catch (error: unknown) {
    console.error(formatDatabaseConnectionError(error, env.DATABASE_URL));
    process.exit(1);
  }

  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder });
    logger.info('Database migrations completed');
  } catch (error: unknown) {
    console.error(formatDatabaseConnectionError(error, env.DATABASE_URL));
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
