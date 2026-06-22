import type { PublicWebRevalidationOptions, PublicWebRevalidator } from '@ecommerce-amazon/domain';
import type { Logger } from '@ecommerce-amazon/shared';

const DEFAULT_MAX_ATTEMPTS = 4;
const RETRY_BASE_DELAY_MS = 1_500;

function formatUnknownCause(cause: unknown): string | null {
  if (cause instanceof Error) {
    return cause.message;
  }
  if (typeof cause === 'string') {
    return cause;
  }
  return null;
}

function formatFetchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const causeMessage = formatUnknownCause(error.cause);
  if (causeMessage !== null) {
    return `${error.message} (${causeMessage})`;
  }

  return error.message;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class HttpPublicWebRevalidator implements PublicWebRevalidator {
  constructor(
    private readonly webPublicUrl: string,
    private readonly secret: string,
    private readonly logger: Logger,
    private readonly maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  ) {}

  async revalidate(options: PublicWebRevalidationOptions): Promise<void> {
    const paths = options.paths ?? [];
    const layoutPaths = options.layoutPaths ?? [];
    const tags = options.tags ?? [];

    if (!this.secret || (paths.length === 0 && layoutPaths.length === 0 && tags.length === 0)) {
      return;
    }

    const revalidateUrl = `${this.webPublicUrl.replace(/\/+$/, '')}/api/revalidate`;
    const body = JSON.stringify({ paths, layoutPaths, tags });
    const logContext = { url: revalidateUrl, paths, layoutPaths, tags };

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const response = await fetch(revalidateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.secret}`,
          },
          body,
        });

        if (!response.ok) {
          this.logger.warn('Public web revalidation failed', {
            ...logContext,
            status: response.status,
            attempt,
          });
          return;
        }

        this.logger.info('Public web revalidation succeeded', {
          ...logContext,
          attempt,
        });
        return;
      } catch (error) {
        const isLastAttempt = attempt >= this.maxAttempts;
        if (!isLastAttempt) {
          this.logger.warn('Public web revalidation request failed, retrying', {
            ...logContext,
            attempt,
            error: formatFetchError(error),
          });
          await sleep(RETRY_BASE_DELAY_MS * attempt);
          continue;
        }

        this.logger.warn('Public web revalidation request failed', {
          ...logContext,
          attempt,
          error: formatFetchError(error),
        });
      }
    }
  }
}

export class NoOpPublicWebRevalidator implements PublicWebRevalidator {
  revalidate(_options: PublicWebRevalidationOptions): Promise<void> {
    return Promise.resolve();
  }
}
