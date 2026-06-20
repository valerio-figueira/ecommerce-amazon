import { describe, expect, it, vi } from 'vitest';

import { ConflictError } from '@ecommerce-amazon/domain';

import { CreateCategory } from './CreateCategory.js';
import { createMockPublicWebRevalidator } from '../../test/mock-factories.js';

describe('CreateCategory', () => {
  it('rejects duplicate slug', async () => {
    const categoryRepository = {
      slugExists: vi.fn().mockResolvedValue(true),
    };

    const useCase = new CreateCategory(
      categoryRepository as never,
      createMockPublicWebRevalidator(),
    );

    await expect(
      useCase.execute({
        slug: 'games',
        label: 'Games',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
