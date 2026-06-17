import { and, asc, eq, ne, sql } from 'drizzle-orm';

import {
  EntityNotFoundError,
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
  parseOperatorRole,
  parseTeamPublicRole,
  type CreateOperatorData,
  type OperatorRepository,
  type OperatorSocialLinks,
  type PublicTeamMember,
  type UpdateOperatorAccessData,
  type UpdateOperatorProfileData,
} from '@ecommerce-amazon/domain';

import type { DrizzleClient } from '../drizzle/client.js';
import { schema } from '../drizzle/client.js';

function parseOperatorStatus(status: string): OperatorStatus {
  if (status === OperatorStatus.DISABLED) {
    return OperatorStatus.DISABLED;
  }
  return OperatorStatus.ACTIVE;
}

function mapSocialLinks(raw: Operator['socialLinks'] | null | undefined): OperatorSocialLinks | null {
  if (!raw) return null;
  const links: OperatorSocialLinks = {};
  if (raw.linkedin) links.linkedin = raw.linkedin;
  if (raw.instagram) links.instagram = raw.instagram;
  if (raw.x) links.x = raw.x;
  if (raw.telegram) links.telegram = raw.telegram;
  return Object.keys(links).length > 0 ? links : null;
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

  async findAll(): Promise<Operator[]> {
    const rows = await this.db
      .select()
      .from(schema.operators)
      .orderBy(asc(schema.operators.name));

    return rows.map((row) => this.mapRow(row));
  }

  async countActiveAdmins(excludeId?: string): Promise<number> {
    const conditions = [
      eq(schema.operators.role, OperatorRole.ADMIN),
      eq(schema.operators.status, OperatorStatus.ACTIVE),
    ];

    if (excludeId) {
      conditions.push(ne(schema.operators.id, excludeId));
    }

    const rows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.operators)
      .where(and(...conditions));

    return rows[0]?.count ?? 0;
  }

  async create(data: CreateOperatorData): Promise<Operator> {
    const now = new Date();
    const rows = await this.db
      .insert(schema.operators)
      .values({
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role,
        status: OperatorStatus.ACTIVE,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const row = rows[0];
    if (!row) {
      throw new Error('Failed to create operator');
    }

    return this.mapRow(row);
  }

  async findPublicTeamMembers(): Promise<PublicTeamMember[]> {
    const rows = await this.db
      .select({
        name: schema.operators.name,
        jobTitle: schema.operators.jobTitle,
        bio: schema.operators.bio,
        avatarUrl: schema.operators.avatarUrl,
        socialLinks: schema.operators.socialLinks,
        teamPublicRole: schema.operators.teamPublicRole,
        teamSortOrder: schema.operators.teamSortOrder,
      })
      .from(schema.operators)
      .where(
        and(
          eq(schema.operators.status, OperatorStatus.ACTIVE),
          eq(schema.operators.showOnTeam, true),
        ),
      )
      .orderBy(asc(schema.operators.teamSortOrder), asc(schema.operators.name));

    return rows.map((row) => ({
      name: row.name,
      jobTitle: row.jobTitle,
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      socialLinks: mapSocialLinks(row.socialLinks),
      publicTeamRole: row.teamPublicRole
        ? parseTeamPublicRole(row.teamPublicRole)
        : TeamPublicRole.MEMBER,
    }));
  }

  async updateProfile(id: string, data: UpdateOperatorProfileData): Promise<Operator> {
    const rows = await this.db
      .update(schema.operators)
      .set({
        name: data.name,
        bio: data.bio,
        jobTitle: data.jobTitle,
        socialLinks: data.socialLinks,
        showOnTeam: data.showOnTeam,
        teamSortOrder: data.teamSortOrder,
        teamPublicRole: data.teamPublicRole,
        updatedAt: new Date(),
      })
      .where(eq(schema.operators.id, id))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('Operator', id);
    }

    return this.mapRow(row);
  }

  async updateAvatarUrl(id: string, avatarUrl: string | null): Promise<Operator> {
    const rows = await this.db
      .update(schema.operators)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(schema.operators.id, id))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('Operator', id);
    }

    return this.mapRow(row);
  }

  async updateAccess(id: string, data: UpdateOperatorAccessData): Promise<Operator> {
    const patch: Partial<typeof schema.operators.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.role !== undefined) patch.role = data.role;
    if (data.status !== undefined) patch.status = data.status;

    const rows = await this.db
      .update(schema.operators)
      .set(patch)
      .where(eq(schema.operators.id, id))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('Operator', id);
    }

    return this.mapRow(row);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<Operator> {
    const rows = await this.db
      .update(schema.operators)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.operators.id, id))
      .returning();

    const row = rows[0];
    if (!row) {
      throw new EntityNotFoundError('Operator', id);
    }

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
      row.jobTitle,
      mapSocialLinks(row.socialLinks),
      row.showOnTeam,
      row.teamSortOrder,
      row.teamPublicRole ? parseTeamPublicRole(row.teamPublicRole) : TeamPublicRole.MEMBER,
      row.createdAt,
      row.updatedAt,
    );
  }
}
