import { Redis } from 'ioredis';

import type { CacheInvalidator, CacheStore } from '@ecommerce-amazon/domain';

import { parseRedisUrl, type RedisConnectionOptions } from './redis-connection.js';

function parseJsonValue(raw: string): unknown {
  return JSON.parse(raw);
}

export class RedisCacheStore implements CacheStore, CacheInvalidator {
  constructor(private readonly redis: Redis) {}

  async get(key: string): Promise<unknown | null> {
    const raw = await this.redis.get(key);
    if (!raw) return null;
    return parseJsonValue(raw);
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async getVersion(entityType: string, id: string): Promise<number> {
    const value = await this.redis.get(`cache:version:${entityType}:${id}`);
    return value ? Number(value) : 0;
  }

  async incrementVersion(entityType: string, id: string): Promise<number> {
    return this.redis.incr(`cache:version:${entityType}:${id}`);
  }

  async invalidateProducts(productIds: string[]): Promise<void> {
    for (const id of productIds) {
      await this.incrementVersion('product', id);
    }
  }
}

export function createRedisClient(options: RedisConnectionOptions): Redis {
  return new Redis(options);
}

export { parseRedisUrl };
