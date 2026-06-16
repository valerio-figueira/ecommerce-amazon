import { describe, expect, it, vi } from 'vitest';

import {
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
  ValidationError,
} from '@ecommerce-amazon/domain';

import { UpdateOperatorProfile } from './UpdateOperatorProfile.js';

function createTestOperator(overrides: Partial<{
  id: string;
  name: string;
  bio: string | null;
  showOnTeam: boolean;
  teamPublicRole: TeamPublicRole;
}> = {}): Operator {
  const now = new Date();
  return new Operator(
    overrides.id ?? 'op-1',
    'admin@vitrine.local',
    'hashed-password',
    overrides.name ?? 'Admin Vitrine',
    null,
    overrides.bio ?? 'Bio curta',
    OperatorRole.ADMIN,
    OperatorStatus.ACTIVE,
    null,
    null,
    overrides.showOnTeam ?? false,
    null,
    overrides.teamPublicRole ?? TeamPublicRole.MEMBER,
    now,
    now,
  );
}

describe('UpdateOperatorProfile', () => {
  const operator = createTestOperator();

  it('updates profile and returns refreshed token', async () => {
    const updated = createTestOperator({
      name: 'Novo Nome',
      bio: 'Nova bio',
      showOnTeam: true,
      teamPublicRole: TeamPublicRole.FOUNDER,
    });

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
      jobTitle: null,
      socialLinks: null,
      showOnTeam: true,
      teamSortOrder: null,
      publicTeamRole: TeamPublicRole.FOUNDER,
    });

    expect(result.token).toBe('new-jwt');
    expect(result.operator.name).toBe('Novo Nome');
    expect(result.operator.bio).toBe('Nova bio');
    expect(result.operator.showOnTeam).toBe(true);
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
      useCase.execute({
        operatorId: 'op-1',
        name: '   ',
        bio: null,
        jobTitle: null,
        socialLinks: null,
        showOnTeam: false,
        teamSortOrder: null,
        publicTeamRole: TeamPublicRole.MEMBER,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
