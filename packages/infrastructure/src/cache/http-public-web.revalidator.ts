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
    const tags = options.tags ?? [];

    if (!this.secret || (paths.length === 0 && layoutPaths.length === 0 && tags.length === 0)) {
      return;
    }

    const revalidateUrl = `${this.webPublicUrl.replace(/\/+$/, '')}/api/revalidate`;

    try {
      const response = await fetch(revalidateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secret}`,
        },
        body: JSON.stringify({ paths, layoutPaths, tags }),
      });

      if (!response.ok) {
        this.logger.warn('Public web revalidation failed', {
          status: response.status,
          url: revalidateUrl,
          paths,
          layoutPaths,
          tags,
        });
        return;
      }

      this.logger.info('Public web revalidation succeeded', {
        url: revalidateUrl,
        paths,
        layoutPaths,
        tags,
      });
    } catch (error) {
      this.logger.warn('Public web revalidation request failed', {
        error: error instanceof Error ? error.message : String(error),
        url: revalidateUrl,
        paths,
        layoutPaths,
        tags,
      });
    }
  }
}

export class NoOpPublicWebRevalidator implements PublicWebRevalidator {
  revalidate(_options: PublicWebRevalidationOptions): Promise<void> {
    return Promise.resolve();
  }
}
