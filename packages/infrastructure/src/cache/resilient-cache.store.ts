import type { CacheInvalidator, CacheStore, PageCacheInvalidator } from '@ecommerce-amazon/domain';
import type { Logger } from '@ecommerce-amazon/shared';

import type { RedisCacheStore } from './redis-cache.store.js';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Wraps a cache backend so transient Redis outages degrade to cache miss / no-op
 * instead of failing API requests.
 */
export class ResilientCacheStore implements CacheStore, CacheInvalidator, PageCacheInvalidator {
  constructor(
    private readonly inner: RedisCacheStore,
    private readonly logger: Logger,
  ) {}

  async get(key: string): Promise<unknown> {
    try {
      return await this.inner.get(key);
    } catch (error) {
      this.logger.warn('Cache get failed; treating as miss', { key, error: errorMessage(error) });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.inner.set(key, value, ttlSeconds);
    } catch (error) {
      this.logger.warn('Cache set failed; continuing without cache', {
        key,
        error: errorMessage(error),
      });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.inner.del(key);
    } catch (error) {
      this.logger.warn('Cache del failed; continuing', { key, error: errorMessage(error) });
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.inner.increment(key);
    } catch (error) {
      this.logger.warn('Cache increment failed; returning 0', { key, error: errorMessage(error) });
      return 0;
    }
  }

  async getVersion(entityType: string, id: string): Promise<number> {
    try {
      return await this.inner.getVersion(entityType, id);
    } catch (error) {
      this.logger.warn('Cache getVersion failed; treating as 0', {
        entityType,
        id,
        error: errorMessage(error),
      });
      return 0;
    }
  }

  async incrementVersion(entityType: string, id: string): Promise<number> {
    try {
      return await this.inner.incrementVersion(entityType, id);
    } catch (error) {
      this.logger.warn('Cache incrementVersion failed; continuing', {
        entityType,
        id,
        error: errorMessage(error),
      });
      return 0;
    }
  }

  async invalidateProducts(productIds: string[]): Promise<void> {
    try {
      await this.inner.invalidateProducts(productIds);
    } catch (error) {
      this.logger.warn('Cache invalidateProducts failed; continuing', {
        count: productIds.length,
        error: errorMessage(error),
      });
    }
  }

  async invalidateBySlug(slug: string): Promise<void> {
    try {
      await this.inner.invalidateBySlug(slug);
    } catch (error) {
      this.logger.warn('Cache invalidateBySlug failed; continuing', {
        slug,
        error: errorMessage(error),
      });
    }
  }
}
