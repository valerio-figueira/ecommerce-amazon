import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema/index.js';

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;

export function createDrizzleClient(databaseUrl: string) {
  const client = postgres(databaseUrl);
  return drizzle(client, { schema });
}

export { schema };
