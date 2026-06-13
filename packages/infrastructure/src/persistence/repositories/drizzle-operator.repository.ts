import { eq } from 'drizzle-orm';

import {
  Operator,
  OperatorStatus,
  type OperatorRepository,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function parseOperatorStatus(status: string): OperatorStatus {
  if (status === OperatorStatus.DISABLED) {
    return OperatorStatus.DISABLED;
  }
  return OperatorStatus.ACTIVE;
}

export class DrizzleOperatorRepository implements OperatorRepository {
  constructor(private readonly db: DrizzleClient) {}

  async findByEmail(email: string): Promise<Operator | null> {
    const rows = await this.db
      .select()
      .from(schema.operators)
      .where(eq(schema.operators.email, email))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return new Operator(
      row.id,
      row.email,
      row.passwordHash,
      row.name,
      parseOperatorStatus(row.status),
      row.createdAt,
      row.updatedAt,
    );
  }
}
