import { describe, expect, it, vi } from 'vitest';

import {
  AutoLink,
  ConflictError,
  EntityNotFoundError,
  type AutoLinkRepository,
  type CacheStore,
} from '@ecommerce-amazon/domain';
import { AUTO_LINKS_CACHE_KEY } from '@ecommerce-amazon/shared/seo';

import { createMockPublicWebRevalidator } from '../../test/mock-factories.js';
import { CreateAutoLink } from './CreateAutoLink.js';
import { DeleteAutoLink } from './DeleteAutoLink.js';
import { UpdateAutoLink } from './UpdateAutoLink.js';

const existingLink = AutoLink.create({
  id: 'a1111111-1111-4111-8111-111111111111',
  keyword: 'cadeira ergonômica',
  targetUrl: '/produtos/cadeira-ergonomica',
  maxMatches: 1,
  priority: 2,
  isActive: true,
});

function createRepositoryMock(overrides: Partial<AutoLinkRepository> = {}): AutoLinkRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findByKeywordNormalized: vi.fn().mockResolvedValue(null),
    findAllActiveSortedByPriority: vi.fn().mockResolvedValue([]),
    listPaginated: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    delete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createCacheMock(): CacheStore {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
    increment: vi.fn().mockResolvedValue(1),
    getVersion: vi.fn().mockResolvedValue(0),
    incrementVersion: vi.fn().mockResolvedValue(1),
  };
}

describe('CreateAutoLink', () => {
  it('throws ConflictError when keyword already exists', async () => {
    const repository = createRepositoryMock({
      findByKeywordNormalized: vi.fn().mockResolvedValue(existingLink),
    });
    const cache = createCacheMock();
    const useCase = new CreateAutoLink(repository, cache, createMockPublicWebRevalidator());

    await expect(
      useCase.execute({
        keyword: 'cadeira ergonômica',
        targetUrl: '/produtos/outro',
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(repository.save).not.toHaveBeenCalled();
    expect(cache.del).not.toHaveBeenCalled();
  });

  it('saves auto link and invalidates cache', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const useCase = new CreateAutoLink(repository, cache, createMockPublicWebRevalidator());

    const result = await useCase.execute({
      keyword: 'headset gamer',
      targetUrl: '/produtos/headset-gamer',
      maxMatches: 2,
      priority: 5,
      isActive: true,
    });

    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(repository.save).toHaveBeenCalledOnce();
    expect(cache.del).toHaveBeenCalledWith(AUTO_LINKS_CACHE_KEY);
  });
});

describe('UpdateAutoLink', () => {
  it('throws EntityNotFoundError when auto link does not exist', async () => {
    const repository = createRepositoryMock();
    const cache = createCacheMock();
    const useCase = new UpdateAutoLink(repository, cache, createMockPublicWebRevalidator());

    await expect(
      useCase.execute('b2222222-2222-4222-8222-222222222222', { isActive: false }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });

  it('updates auto link and invalidates cache', async () => {
    const repository = createRepositoryMock({
      findById: vi.fn().mockResolvedValue(existingLink),
    });
    const cache = createCacheMock();
    const useCase = new UpdateAutoLink(repository, cache, createMockPublicWebRevalidator());

    await useCase.execute(existingLink.id, { isActive: false, priority: 10 });

    expect(repository.save).toHaveBeenCalledOnce();
    expect(cache.del).toHaveBeenCalledWith(AUTO_LINKS_CACHE_KEY);
  });
});

describe('DeleteAutoLink', () => {
  it('deletes auto link and invalidates cache', async () => {
    const repository = createRepositoryMock({
      findById: vi.fn().mockResolvedValue(existingLink),
    });
    const cache = createCacheMock();
    const useCase = new DeleteAutoLink(repository, cache, createMockPublicWebRevalidator());

    await useCase.execute(existingLink.id);

    expect(repository.delete).toHaveBeenCalledWith(existingLink.id);
    expect(cache.del).toHaveBeenCalledWith(AUTO_LINKS_CACHE_KEY);
  });
});
