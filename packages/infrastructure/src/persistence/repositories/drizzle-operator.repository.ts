import { eq } from 'drizzle-orm';

import {
  Operator,
  OperatorStatus,
  parseOperatorRole,
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

    return this.mapRow(row);
  }

  async findById(id: string): Promise<Operator | null> {
    const rows = await this.db
      .select()
      .from(schema.operators)
      .where(eq(schema.operators.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapRow(row);
  }

  private mapRow(row: typeof schema.operators.$inferSelect): Operator {
    return new Operator(
      row.id,
      row.email,
      row.passwordHash,
      row.name,
      row.avatarUrl,
      row.bio,
      parseOperatorRole(row.role),
      parseOperatorStatus(row.status),
      row.createdAt,
      row.updatedAt,
    );
  }
}
