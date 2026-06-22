import {
  EntityNotFoundError,
  PageKind,
  PageStatus,
  type PageRepository,
  type PublicWebRevalidator,
} from '@ecommerce-amazon/domain';
import type { BrandConfig } from '@ecommerce-amazon/shared/config/brand';
import {
  isInstitutionalPageSlug,
  parseInstitutionalPageContent,
  resolveInstitutionalPageContent,
  type InstitutionalPageContent,
  type InstitutionalPageSlug,
} from '@ecommerce-amazon/shared/institutional';

import { buildInstitutionalRevalidationOptions } from '../../cache/public-cache.helpers.js';

type InstitutionalPageLayout = {
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
};

export type InstitutionalPageResult = {
  layout: InstitutionalPageLayout;
  content: InstitutionalPageContent;
};

export type AdminInstitutionalPageResult = InstitutionalPageResult & {
  status: PageStatus;
  pageKind: PageKind;
};

function buildLayoutResponse(layout: {
  slug: string;
  seoTitle?: string | null | undefined;
  seoDescription?: string | null | undefined;
  updatedAt: Date;
}): InstitutionalPageLayout {
  return {
    slug: layout.slug,
    seoTitle: layout.seoTitle ?? null,
    seoDescription: layout.seoDescription ?? null,
    updatedAt: layout.updatedAt.toISOString(),
  };
}

export class GetPublishedInstitutionalPage {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(slug: string, brand: BrandConfig): Promise<InstitutionalPageResult | null> {
    if (!isInstitutionalPageSlug(slug)) return null;

    const result = await this.pageRepository.findPublishedInstitutionalBySlug(slug);
    if (!result) return null;

    const { layout } = result;
    const content = resolveInstitutionalPageContent(
      slug,
      layout.institutionalContent ?? null,
      brand,
    );

    return {
      layout: buildLayoutResponse(layout),
      content,
    };
  }
}

export class GetAdminInstitutionalPage {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(slug: string, brand: BrandConfig): Promise<AdminInstitutionalPageResult | null> {
    if (!isInstitutionalPageSlug(slug)) return null;

    const result = await this.pageRepository.findInstitutionalBySlug(slug);
    if (!result) return null;

    const { layout } = result;
    const content = resolveInstitutionalPageContent(
      slug,
      layout.institutionalContent ?? null,
      brand,
    );

    return {
      layout: buildLayoutResponse(layout),
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
    slug: InstitutionalPageSlug;
    content: InstitutionalPageContent;
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: PageStatus;
  }): Promise<AdminInstitutionalPageResult> {
    const existing = await this.pageRepository.findInstitutionalBySlug(input.slug);
    if (!existing) {
      throw new EntityNotFoundError('InstitutionalPage', input.slug);
    }

    const content = parseInstitutionalPageContent(input.slug, {
      ...input.content,
      lastUpdated: new Date().toISOString().slice(0, 10),
    });

    const shouldPublish = input.status === PageStatus.PUBLISHED;
    const publishedAt = shouldPublish && !existing.layout.publishedAt ? new Date() : undefined;

    const updated = await this.pageRepository.updateInstitutionalContent(existing.layout.id, {
      content: content,
      ...(input.seoTitle !== undefined ? { seoTitle: input.seoTitle } : {}),
      ...(input.seoDescription !== undefined ? { seoDescription: input.seoDescription } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    });

    await this.webRevalidator.revalidate(buildInstitutionalRevalidationOptions(input.slug));

    return {
      layout: buildLayoutResponse(updated.layout),
      content,
      status: updated.layout.status,
      pageKind: updated.layout.pageKind,
    };
  }
}
