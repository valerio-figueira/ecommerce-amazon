const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

type AttemptRecord = {
  failures: number;
  windowStartedAt: number;
};

export type LoginRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function createLoginRateLimiter(options?: { maxAttempts?: number; windowMs?: number }) {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const attempts = new Map<string, AttemptRecord>();

  function getRecord(clientIp: string, now: number): AttemptRecord {
    const existing = attempts.get(clientIp);
    if (!existing || now - existing.windowStartedAt >= windowMs) {
      const fresh: AttemptRecord = { failures: 0, windowStartedAt: now };
      attempts.set(clientIp, fresh);
      return fresh;
    }
    return existing;
  }

  return {
    check(clientIp: string): LoginRateLimitResult {
      const now = Date.now();
      const record = getRecord(clientIp, now);
      if (record.failures < maxAttempts) {
        return { allowed: true, retryAfterSeconds: 0 };
      }

      const retryAfterMs = windowMs - (now - record.windowStartedAt);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    },

    recordFailure(clientIp: string): void {
      const now = Date.now();
      const record = getRecord(clientIp, now);
      record.failures += 1;
      attempts.set(clientIp, record);
    },

    reset(clientIp: string): void {
      attempts.delete(clientIp);
    },
  };
}
