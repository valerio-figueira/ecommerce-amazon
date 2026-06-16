import { PageKind, PageStatus, type PageRepository } from '@ecommerce-amazon/domain';
import {
  resolveAboutPageContent,
  type AboutPageContent,
  type InstitutionalPageResponse,
} from '@ecommerce-amazon/shared/about';
import type { BrandConfig } from '@ecommerce-amazon/shared/config/brand';

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
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(input: {
    slug: string;
    content: AboutPageContent;
    seoTitle?: string | null;
    seoDescription?: string | null;
  }): Promise<InstitutionalPageResponse> {
    const existing = await this.pageRepository.findInstitutionalBySlug(input.slug);
    if (!existing) {
      throw new Error(`Institutional page not found: ${input.slug}`);
    }

    const updated = await this.pageRepository.updateInstitutionalContent(
      existing.layout.id,
      input.content as unknown as Record<string, unknown>,
      input.seoTitle,
      input.seoDescription,
    );

    return {
      layout: {
        slug: updated.layout.slug,
        seoTitle: updated.layout.seoTitle ?? null,
        seoDescription: updated.layout.seoDescription ?? null,
        updatedAt: updated.layout.updatedAt.toISOString(),
      },
      content: input.content,
    };
  }
}
