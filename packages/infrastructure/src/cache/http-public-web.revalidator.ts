import type { PublicWebRevalidationOptions, PublicWebRevalidator } from '@ecommerce-amazon/domain';
import type { Logger } from '@ecommerce-amazon/shared';

export class HttpPublicWebRevalidator implements PublicWebRevalidator {
  constructor(
    private readonly webPublicUrl: string,
    private readonly secret: string,
    private readonly logger: Logger,
  ) {}

  async revalidate(options: PublicWebRevalidationOptions): Promise<void> {
    const paths = options.paths ?? [];
    const layoutPaths = options.layoutPaths ?? [];

    if (!this.secret || (paths.length === 0 && layoutPaths.length === 0)) {
      return;
    }

    try {
      const response = await fetch(`${this.webPublicUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secret}`,
        },
        body: JSON.stringify({ paths, layoutPaths }),
      });

      if (!response.ok) {
        this.logger.warn('Public web revalidation failed', {
          status: response.status,
          url: this.webPublicUrl,
          paths,
          layoutPaths,
        });
        return;
      }

      this.logger.info('Public web revalidation succeeded', {
        paths,
        layoutPaths,
      });
    } catch (error) {
      this.logger.warn('Public web revalidation request failed', {
        error: error instanceof Error ? error.message : String(error),
        paths,
        layoutPaths,
      });
    }
  }
}

export class NoOpPublicWebRevalidator implements PublicWebRevalidator {
  revalidate(_options: PublicWebRevalidationOptions): Promise<void> {
    return Promise.resolve();
  }
}
