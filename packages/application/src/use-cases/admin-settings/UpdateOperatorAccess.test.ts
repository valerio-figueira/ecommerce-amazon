import { describe, expect, it, vi } from 'vitest';

import {
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { UpdateOperatorAccess } from './UpdateOperatorAccess.js';

function buildOperator(overrides: Partial<ConstructorParameters<typeof Operator>[0]> = {}) {
  return new Operator(
    overrides.id ?? '90111111-1111-4111-8111-111111111111',
    overrides.email ?? 'admin@vitrine.local',
    overrides.passwordHash ?? 'hash',
    overrides.name ?? 'Admin',
    overrides.avatarUrl ?? null,
    overrides.bio ?? null,
    overrides.role ?? OperatorRole.ADMIN,
    overrides.status ?? OperatorStatus.ACTIVE,
    overrides.jobTitle ?? null,
    overrides.socialLinks ?? null,
    overrides.showOnTeam ?? false,
    overrides.teamSortOrder ?? null,
    overrides.teamPublicRole ?? TeamPublicRole.MEMBER,
    overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z'),
    overrides.updatedAt ?? new Date('2024-01-01T00:00:00.000Z'),
  );
}

describe('UpdateOperatorAccess', () => {
  it('prevents self-disable', async () => {
    const operator = buildOperator();
    const operatorRepository = {
      findById: vi.fn().mockResolvedValue(operator),
      countActiveAdmins: vi.fn(),
      findAll: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      updateProfile: vi.fn(),
      updateAvatarUrl: vi.fn(),
      updateAccess: vi.fn(),
      updatePasswordHash: vi.fn(),
      findPublicTeamMembers: vi.fn(),
    };

    const useCase = new UpdateOperatorAccess(operatorRepository);

    await expect(
      useCase.execute({
        operatorId: operator.id,
        actorId: operator.id,
        status: OperatorStatus.DISABLED,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('prevents removing the last active admin', async () => {
    const operator = buildOperator();
    const operatorRepository = {
      findById: vi.fn().mockResolvedValue(operator),
      countActiveAdmins: vi.fn().mockResolvedValue(0),
      findAll: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      updateProfile: vi.fn(),
      updateAvatarUrl: vi.fn(),
      updateAccess: vi.fn(),
      updatePasswordHash: vi.fn(),
      findPublicTeamMembers: vi.fn(),
    };

    const useCase = new UpdateOperatorAccess(operatorRepository);

    await expect(
      useCase.execute({
        operatorId: operator.id,
        actorId: 'other-admin',
        status: OperatorStatus.DISABLED,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
