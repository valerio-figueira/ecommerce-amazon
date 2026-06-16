import { describe, expect, it, vi } from 'vitest';

import {
  AuthenticationError,
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
} from '@ecommerce-amazon/domain';

import { AuthenticateOperator } from './AuthenticateOperator.js';

function createTestOperator(
  id: string,
  email: string,
  name: string,
  status: OperatorStatus,
): Operator {
  const now = new Date();
  return new Operator(
    id,
    email,
    'hashed-password',
    name,
    null,
    null,
    OperatorRole.ADMIN,
    status,
    null,
    null,
    false,
    null,
    TeamPublicRole.MEMBER,
    now,
    now,
  );
}

describe('AuthenticateOperator', () => {
  const activeOperator = createTestOperator(
    'op-1',
    'admin@vitrine.local',
    'Admin Vitrine',
    OperatorStatus.ACTIVE,
  );

  it('returns token and operator DTO for valid credentials', async () => {
    const operatorRepository = {
      findByEmail: vi.fn().mockResolvedValue(activeOperator),
    };
    const passwordHasher = {
      hash: vi.fn(),
      verify: vi.fn().mockResolvedValue(true),
    };
    const authTokenService = {
      sign: vi.fn().mockResolvedValue('jwt-token'),
      verify: vi.fn(),
    };

    const useCase = new AuthenticateOperator(
      operatorRepository,
      passwordHasher,
      authTokenService,
    );

    const result = await useCase.execute({
      email: 'admin@vitrine.local',
      password: 'secret',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.token).toBe('jwt-token');
      expect(result.value.operator).toEqual({
        id: 'op-1',
        email: 'admin@vitrine.local',
        name: 'Admin Vitrine',
      });
    }
    expect(operatorRepository.findByEmail).toHaveBeenCalledWith('admin@vitrine.local');
  });

  it('returns AuthenticationError when operator is missing', async () => {
    const useCase = new AuthenticateOperator(
      { findByEmail: vi.fn().mockResolvedValue(null) },
      { hash: vi.fn(), verify: vi.fn() },
      { sign: vi.fn(), verify: vi.fn() },
    );

    const result = await useCase.execute({
      email: 'missing@vitrine.local',
      password: 'secret',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthenticationError);
    }
  });

  it('returns AuthenticationError when password is invalid', async () => {
    const useCase = new AuthenticateOperator(
      { findByEmail: vi.fn().mockResolvedValue(activeOperator) },
      { hash: vi.fn(), verify: vi.fn().mockResolvedValue(false) },
      { sign: vi.fn(), verify: vi.fn() },
    );

    const result = await useCase.execute({
      email: 'admin@vitrine.local',
      password: 'wrong',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthenticationError);
    }
  });

  it('returns AuthenticationError when operator is disabled', async () => {
    const disabledOperator = createTestOperator(
      'op-2',
      'disabled@vitrine.local',
      'Disabled',
      OperatorStatus.DISABLED,
    );

    const useCase = new AuthenticateOperator(
      { findByEmail: vi.fn().mockResolvedValue(disabledOperator) },
      { hash: vi.fn(), verify: vi.fn().mockResolvedValue(true) },
      { sign: vi.fn(), verify: vi.fn() },
    );

    const result = await useCase.execute({
      email: 'disabled@vitrine.local',
      password: 'secret',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthenticationError);
    }
  });
});
