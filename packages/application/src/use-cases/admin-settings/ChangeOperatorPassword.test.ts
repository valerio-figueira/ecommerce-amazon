import { describe, expect, it, vi } from 'vitest';

import {
  AuthenticationError,
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { ChangeOperatorPassword } from './ChangeOperatorPassword.js';

describe('ChangeOperatorPassword', () => {
  const operator = new Operator(
    '90111111-1111-4111-8111-111111111111',
    'admin@vitrine.local',
    'hash',
    'Admin',
    null,
    null,
    OperatorRole.ADMIN,
    OperatorStatus.ACTIVE,
    null,
    null,
    false,
    null,
    TeamPublicRole.MEMBER,
    new Date(),
    new Date(),
  );

  it('rejects invalid current password', async () => {
    const operatorRepository = {
      findById: vi.fn().mockResolvedValue(operator),
      updatePasswordHash: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      countActiveAdmins: vi.fn(),
      findPublicTeamMembers: vi.fn(),
      create: vi.fn(),
      updateProfile: vi.fn(),
      updateAvatarUrl: vi.fn(),
      updateAccess: vi.fn(),
    };

    const passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(false),
    };

    const useCase = new ChangeOperatorPassword(operatorRepository, passwordHasher);

    await expect(
      useCase.execute({
        operatorId: operator.id,
        currentPassword: 'wrong',
        newPassword: 'new-password-1',
      }),
    ).rejects.toThrow(AuthenticationError);
  });

  it('rejects when new password equals current password', async () => {
    const operatorRepository = {
      findById: vi.fn().mockResolvedValue(operator),
      updatePasswordHash: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      countActiveAdmins: vi.fn(),
      findPublicTeamMembers: vi.fn(),
      create: vi.fn(),
      updateProfile: vi.fn(),
      updateAvatarUrl: vi.fn(),
      updateAccess: vi.fn(),
    };

    const passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true),
    };

    const useCase = new ChangeOperatorPassword(operatorRepository, passwordHasher);

    await expect(
      useCase.execute({
        operatorId: operator.id,
        currentPassword: 'same-password',
        newPassword: 'same-password',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
