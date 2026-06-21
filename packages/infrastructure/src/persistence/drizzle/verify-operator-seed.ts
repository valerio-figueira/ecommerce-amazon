import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { OperatorStatus, parseOperatorStatus } from '@ecommerce-amazon/domain';
import { createConsoleLogger, loadEnv } from '@ecommerce-amazon/shared';

import { BcryptPasswordHasher } from '../../auth/bcrypt-password.hasher.js';
import { schema } from '../drizzle/client.js';

async function verifyOperatorSeed(): Promise<void> {
  const logger = createConsoleLogger();
  const env = loadEnv();

  if (!env.ADMIN_SEED_EMAIL || !env.ADMIN_SEED_PASSWORD) {
    logger.error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required');
    process.exit(2);
  }

  const sql = postgres(env.DATABASE_URL, { max: 1, onnotice: () => {} });
  const db = drizzle(sql, { schema });

  try {
    const rows = await db
      .select({
        email: schema.operators.email,
        passwordHash: schema.operators.passwordHash,
        status: schema.operators.status,
      })
      .from(schema.operators)
      .where(eq(schema.operators.email, env.ADMIN_SEED_EMAIL.toLowerCase()))
      .limit(1);

    if (rows.length === 0) {
      logger.warn('Operator not found for ADMIN_SEED_EMAIL');
      process.exit(1);
    }

    const operator = rows[0]!;
    if (parseOperatorStatus(operator.status) !== OperatorStatus.ACTIVE) {
      logger.warn('Operator is not active');
      process.exit(1);
    }

    const passwordHasher = new BcryptPasswordHasher(env.PASSWORD_PEPPER);
    const passwordMatches = await passwordHasher.verify(
      env.ADMIN_SEED_PASSWORD,
      operator.passwordHash,
    );

    if (!passwordMatches) {
      logger.warn(
        'Operator password does not match ADMIN_SEED_PASSWORD with current PASSWORD_PEPPER',
      );
      process.exit(1);
    }

    logger.info('Operator seed credentials verified', {
      email: operator.email,
      pepperLength: env.PASSWORD_PEPPER.length,
    });
  } finally {
    await sql.end();
  }
}

verifyOperatorSeed().catch((error: unknown) => {
  const logger = createConsoleLogger();
  const message = error instanceof Error ? error.message : String(error);
  logger.error('Verify operator seed failed', { message });
  process.exit(1);
});
