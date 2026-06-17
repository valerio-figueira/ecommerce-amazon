import { describe, expect, it, vi } from 'vitest';

import {
  AuthenticationError,
  Operator,
  OperatorRole,
  OperatorStatus,
  TeamPublicRole,
} from '@ecommerce-amazon/domain';

import { ValidateOperatorSession } from './ValidateOperatorSession.js';

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

describe('ValidateOperatorSession', () => {
  const activeOperator = createTestOperator(
    'op-1',
    'admin@vitrine.local',
    'Admin Vitrine',
    OperatorStatus.ACTIVE,
  );

  it('returns operator DTO for active operator', async () => {
    const useCase = new ValidateOperatorSession({
      findById: vi.fn().mockResolvedValue(activeOperator),
    } as never);

    const result = await useCase.execute('op-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        id: 'op-1',
        email: 'admin@vitrine.local',
        name: 'Admin Vitrine',
      });
    }
  });

  it('returns AuthenticationError when operator is missing', async () => {
    const useCase = new ValidateOperatorSession({
      findById: vi.fn().mockResolvedValue(null),
    } as never);

    const result = await useCase.execute('missing');

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

    const useCase = new ValidateOperatorSession({
      findById: vi.fn().mockResolvedValue(disabledOperator),
    } as never);

    const result = await useCase.execute('op-2');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(AuthenticationError);
    }
  });
});
