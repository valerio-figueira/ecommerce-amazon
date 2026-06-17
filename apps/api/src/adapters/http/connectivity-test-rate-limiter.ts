const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_ATTEMPTS = 20;

type AttemptRecord = {
  attempts: number;
  windowStartedAt: number;
};

export type ConnectivityTestRateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function createConnectivityTestRateLimiter(options?: {
  maxAttempts?: number;
  windowMs?: number;
}) {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const attempts = new Map<string, AttemptRecord>();

  function getRecord(clientIp: string, now: number): AttemptRecord {
    const existing = attempts.get(clientIp);
    if (!existing || now - existing.windowStartedAt >= windowMs) {
      const fresh: AttemptRecord = { attempts: 0, windowStartedAt: now };
      attempts.set(clientIp, fresh);
      return fresh;
    }
    return existing;
  }

  return {
    check(clientIp: string): ConnectivityTestRateLimitResult {
      const now = Date.now();
      const record = getRecord(clientIp, now);
      if (record.attempts < maxAttempts) {
        return { allowed: true, retryAfterSeconds: 0 };
      }

      const retryAfterMs = windowMs - (now - record.windowStartedAt);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
      };
    },

    recordAttempt(clientIp: string): void {
      const now = Date.now();
      const record = getRecord(clientIp, now);
      record.attempts += 1;
      attempts.set(clientIp, record);
    },
  };
}
