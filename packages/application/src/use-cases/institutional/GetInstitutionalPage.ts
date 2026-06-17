import {
  EntityNotFoundError,
  PageKind,
  PageStatus,
  type PageRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import {
  resolveAboutPageContent,
  type AboutPageContent,
  type InstitutionalPageResponse,
} from '@ecommerce-amazon/shared/about';
import type { BrandConfig } from '@ecommerce-amazon/shared/config/brand';

import { buildInstitutionalPagePublicPath } from '../../cache/public-cache.helpers.js';

export class GetPublishedInstitutionalPage {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(slug: string, brand: BrandConfig): Promise<InstitutionalPageResponse | null> {
    const result = await this.pageRepository.findPublishedInstitutionalBySlug(slug);
    if (!result) return null;

    const { layout } = result;
    const content = resolveAboutPageContent(layout.institutionalContent ?? null, brand);

    return {
      layout: {
        slug: layout.slug,
        seoTitle: layout.seoTitle ?? null,
        seoDescription: layout.seoDescription ?? null,
        updatedAt: layout.updatedAt.toISOString(),
      },
      content,
    };
  }
}

export class GetAdminInstitutionalPage {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(
    slug: string,
    brand: BrandConfig,
  ): Promise<(InstitutionalPageResponse & { status: PageStatus; pageKind: PageKind }) | null> {
    const result = await this.pageRepository.findInstitutionalBySlug(slug);
    if (!result) return null;

    const { layout } = result;
    const content = resolveAboutPageContent(layout.institutionalContent ?? null, brand);

    return {
      layout: {
        slug: layout.slug,
        seoTitle: layout.seoTitle ?? null,
        seoDescription: layout.seoDescription ?? null,
        updatedAt: layout.updatedAt.toISOString(),
      },
      content,
      status: layout.status,
      pageKind: layout.pageKind,
    };
  }
}

export class UpdateInstitutionalPage {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly webRevalidator: PublicWebRevalidator,
  ) {}

  async execute(input: {
    slug: string;
    content: AboutPageContent;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: PageStatus;
  }): Promise<InstitutionalPageResponse & { status: PageStatus; pageKind: PageKind }> {
    const existing = await this.pageRepository.findInstitutionalBySlug(input.slug);
    if (!existing) {
      throw new EntityNotFoundError('InstitutionalPage', input.slug);
    }

    const content: AboutPageContent = {
      ...input.content,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };

    const shouldPublish = input.status === PageStatus.PUBLISHED;
    const publishedAt =
      shouldPublish && !existing.layout.publishedAt ? new Date() : undefined;

    const updated = await this.pageRepository.updateInstitutionalContent(existing.layout.id, {
      content: content as unknown as Record<string, unknown>,
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    });

    await this.webRevalidator.revalidate({
      paths: [buildInstitutionalPagePublicPath(input.slug)],
    });

    return {
      layout: {
        slug: updated.layout.slug,
        seoTitle: updated.layout.seoTitle ?? null,
        seoDescription: updated.layout.seoDescription ?? null,
        updatedAt: updated.layout.updatedAt.toISOString(),
      },
      content,
      status: updated.layout.status,
      pageKind: updated.layout.pageKind,
    };
  }
}
