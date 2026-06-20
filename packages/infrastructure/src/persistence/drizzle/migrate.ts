import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { formatDatabaseConnectionError } from './connection-error.js';
import { loadDotenvFromMonorepoRoot } from './load-env.js';

const migrationPostgresOptions = { max: 1, onnotice: () => {} };

async function assertDatabaseConnection(databaseUrl: string): Promise<void> {
  const client = postgres(databaseUrl, migrationPostgresOptions);
  try {
    await client`SELECT 1`;
  } finally {
    await client.end();
  }
}

export function resolveMigrationsFolder(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const adjacentMigrations = path.join(moduleDir, 'migrations');

  if (existsSync(path.join(adjacentMigrations, 'meta', '_journal.json'))) {
    return adjacentMigrations;
  }

  return path.resolve(moduleDir, '../../../src/persistence/drizzle/migrations');
}

export async function runDatabaseMigrations(options?: {
  databaseUrl?: string;
  migrationsFolder?: string;
}): Promise<void> {
  loadDotenvFromMonorepoRoot();

  const logger = createConsoleLogger();
  const env = loadEnv();
  const databaseUrl = options?.databaseUrl ?? env.DATABASE_URL;
  const migrationsFolder = options?.migrationsFolder ?? resolveMigrationsFolder();

  logger.info('Running database migrations', { migrationsFolder });

  try {
    await assertDatabaseConnection(databaseUrl);
  } catch (error: unknown) {
    throw new Error(formatDatabaseConnectionError(error, databaseUrl));
  }

  const migrationClient = postgres(databaseUrl, migrationPostgresOptions);
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder });
    logger.info('Database migrations completed');
  } catch (error: unknown) {
    throw new Error(formatDatabaseConnectionError(error, databaseUrl));
  } finally {
    await migrationClient.end();
  }
}

function isCliEntrypoint(): boolean {
  const entrypoint = process.argv[1];
  if (!entrypoint) {
    return false;
  }

  return import.meta.url === pathToFileURL(path.resolve(entrypoint)).href;
}

if (isCliEntrypoint()) {
  runDatabaseMigrations().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
