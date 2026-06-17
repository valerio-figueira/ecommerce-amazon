import { describe, expect, it, vi } from 'vitest';

import { createLoginRateLimiter } from './login-rate-limiter.js';

describe('createLoginRateLimiter', () => {
  it('allows attempts below the limit', () => {
    const limiter = createLoginRateLimiter({ maxAttempts: 3, windowMs: 60_000 });

    expect(limiter.check('127.0.0.1').allowed).toBe(true);
    limiter.recordFailure('127.0.0.1');
    limiter.recordFailure('127.0.0.1');
    expect(limiter.check('127.0.0.1').allowed).toBe(true);
  });

  it('blocks after max failures in the window', () => {
    const limiter = createLoginRateLimiter({ maxAttempts: 2, windowMs: 60_000 });

    limiter.recordFailure('10.0.0.1');
    limiter.recordFailure('10.0.0.1');

    const result = limiter.check('10.0.0.1');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets failures after successful login', () => {
    const limiter = createLoginRateLimiter({ maxAttempts: 2, windowMs: 60_000 });

    limiter.recordFailure('10.0.0.2');
    limiter.reset('10.0.0.2');

    expect(limiter.check('10.0.0.2').allowed).toBe(true);
  });

  it('tracks IPs independently', () => {
    const limiter = createLoginRateLimiter({ maxAttempts: 1, windowMs: 60_000 });

    limiter.recordFailure('1.1.1.1');
    expect(limiter.check('1.1.1.1').allowed).toBe(false);
    expect(limiter.check('2.2.2.2').allowed).toBe(true);
  });

  it('resets the window after expiry', () => {
    vi.useFakeTimers();
    const limiter = createLoginRateLimiter({ maxAttempts: 1, windowMs: 1_000 });

    limiter.recordFailure('10.0.0.3');
    expect(limiter.check('10.0.0.3').allowed).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(limiter.check('10.0.0.3').allowed).toBe(true);

    vi.useRealTimers();
  });
});
