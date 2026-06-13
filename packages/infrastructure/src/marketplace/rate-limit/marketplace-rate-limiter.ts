import { Redis } from 'ioredis';

import { Marketplace, MarketplaceRateLimitError } from '@ecommerce-amazon/domain';

export class MarketplaceRateLimiter {
  constructor(private readonly redis: Redis) {}

  private key(marketplace: Marketplace): string {
    return `rate:${marketplace}`;
  }

  async acquire(marketplace: Marketplace, tokens = 1): Promise<void> {
    const key = this.key(marketplace);
    const current = await this.redis.decrby(key, tokens);
    if (current < 0) {
      await this.redis.incrby(key, tokens);
      throw new MarketplaceRateLimitError(marketplace);
    }
  }

  async refill(marketplace: Marketplace, maxTokens: number): Promise<void> {
    const key = this.key(marketplace);
    const ttl = await this.redis.ttl(key);
    if (ttl <= 0) {
      await this.redis.set(key, maxTokens, 'EX', 1);
    }
  }
}
