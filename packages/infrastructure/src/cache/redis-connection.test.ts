import { describe, expect, it } from 'vitest';

import {
  buildRedisConnectionOptions,
  isOverlayIpv4Host,
  redisReconnectOnError,
  redisRetryStrategy,
  resolveRedisHost,
} from './redis-connection.js';

describe('redis-connection', () => {
  it('prefers REDIS_HOST over stale overlay IP in REDIS_URL', () => {
    expect(resolveRedisHost('10.0.1.7', 'redis')).toBe('redis');
  });

  it('falls back to URL hostname when override is empty', () => {
    expect(resolveRedisHost('localhost', undefined)).toBe('localhost');
  });

  it('buildRedisConnectionOptions uses host override', () => {
    const options = buildRedisConnectionOptions('redis://10.0.1.7:6379', 0, 'redis');
    expect(options.host).toBe('redis');
    expect(options.port).toBe(6379);
    expect(options.db).toBe(0);
    expect(options.maxRetriesPerRequest).toBeNull();
    expect(typeof options.retryStrategy).toBe('function');
    expect(typeof options.reconnectOnError).toBe('function');
  });

  it('detects overlay IPv4 hostnames', () => {
    expect(isOverlayIpv4Host('10.0.1.7')).toBe(true);
    expect(isOverlayIpv4Host('redis')).toBe(false);
  });

  it('retries with capped backoff', () => {
    expect(redisRetryStrategy(1)).toBe(100);
    expect(redisRetryStrategy(50)).toBe(3000);
    expect(redisRetryStrategy(101)).toBeNull();
  });

  it('reconnects on transient network errors', () => {
    expect(redisReconnectOnError(new Error('connect EHOSTUNREACH 10.0.1.7:6379'))).toBe(true);
    expect(redisReconnectOnError(new Error('connect ECONNREFUSED 127.0.0.1:6379'))).toBe(true);
    expect(redisReconnectOnError(new Error('WRONGTYPE Operation against a key'))).toBe(false);
  });
});
