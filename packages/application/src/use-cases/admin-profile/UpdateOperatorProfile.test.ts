import { describe, expect, it, vi } from 'vitest';

import {
  Operator,
  OperatorRole,
  OperatorStatus,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { UpdateOperatorProfile } from './UpdateOperatorProfile.js';

describe('UpdateOperatorProfile', () => {
  const operator = new Operator(
    'op-1',
    'admin@vitrine.local',
    'hashed-password',
    'Admin Vitrine',
    null,
    'Bio curta',
    OperatorRole.ADMIN,
    OperatorStatus.ACTIVE,
    new Date(),
    new Date(),
  );

  it('updates profile and returns refreshed token', async () => {
    const updated = new Operator(
      operator.id,
      operator.email,
      operator.passwordHash,
      'Novo Nome',
      operator.avatarUrl,
      'Nova bio',
      operator.role,
      operator.status,
      operator.createdAt,
      new Date(),
    );

    const operatorRepository = {
      findById: vi.fn().mockResolvedValue(operator),
      updateProfile: vi.fn().mockResolvedValue(updated),
    };
    const authTokenService = {
      sign: vi.fn().mockResolvedValue('new-jwt'),
      verify: vi.fn(),
    };

    const useCase = new UpdateOperatorProfile(
      operatorRepository,
      authTokenService,
      () => false,
    );

    const result = await useCase.execute({
      operatorId: 'op-1',
      name: 'Novo Nome',
      bio: 'Nova bio',
    });

    expect(result.token).toBe('new-jwt');
    expect(result.operator.name).toBe('Novo Nome');
    expect(result.operator.bio).toBe('Nova bio');
  });

  it('rejects empty name', async () => {
    const useCase = new UpdateOperatorProfile(
      {
        findById: vi.fn().mockResolvedValue(operator),
        updateProfile: vi.fn(),
      },
      { sign: vi.fn(), verify: vi.fn() },
      () => false,
    );

    await expect(
      useCase.execute({ operatorId: 'op-1', name: '   ', bio: null }),
    ).rejects.toThrow(ValidationError);
  });
});
