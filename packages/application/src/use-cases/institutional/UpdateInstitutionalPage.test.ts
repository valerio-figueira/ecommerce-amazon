import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { EntityNotFoundError, PageKind, PageStatus } from '@ecommerce-amazon/domain';
import {
  buildDefaultAboutPageContent,
  parseAboutPageContent,
} from '@ecommerce-amazon/shared/about';
import { createBrandConfig } from '@ecommerce-amazon/shared/config/brand';

import {
  createMockPageRepository,
  createMockPublicWebRevalidator,
} from '../../test/mock-factories.js';
import { UpdateInstitutionalPage } from './GetInstitutionalPage.js';

const PAGE_ID = 'f2222222-2222-4222-8222-222222222222';
const brand = createBrandConfig({
  SITE_NAME: 'Minha Vitrine',
  SITE_TAGLINE: 'Curadoria de confiança',
  WEB_PUBLIC_URL: 'https://example.com',
});

function createExistingPage(status: PageStatus = PageStatus.PUBLISHED) {
  const content = buildDefaultAboutPageContent(brand);
  return {
    layout: {
      id: PAGE_ID,
      slug: 'sobre',
      title: 'Sobre',
      status,
      pageKind: PageKind.INSTITUTIONAL,
      seoTitle: null,
      seoDescription: null,
      institutionalContent: content as unknown as Record<string, unknown>,
      publishedAt: status === PageStatus.PUBLISHED ? new Date('2026-01-01') : undefined,
      updatedAt: new Date('2026-01-01'),
    },
  };
}

describe('UpdateInstitutionalPage', () => {
  it('saves content and revalidates /sobre', async () => {
    const pageRepository = createMockPageRepository();
    const webRevalidator = createMockPublicWebRevalidator();
    const existing = createExistingPage();
    const nextContent = buildDefaultAboutPageContent(brand);
    nextContent.heroTitle = 'Novo título hero';

    vi.mocked(pageRepository.findInstitutionalBySlug).mockResolvedValue(existing);
    vi.mocked(pageRepository.updateInstitutionalContent).mockResolvedValue({
      layout: {
        ...existing.layout,
        updatedAt: new Date('2026-06-17'),
      },
    });

    const useCase = new UpdateInstitutionalPage(pageRepository, webRevalidator);
    const result = await useCase.execute({
      slug: 'sobre',
      content: nextContent,
      seoTitle: 'SEO custom',
    });

    expect(result.content.heroTitle).toBe('Novo título hero');
    expect(result.layout.seoTitle).toBeNull();
    expect(pageRepository.updateInstitutionalContent).toHaveBeenCalledWith(
      PAGE_ID,
      expect.objectContaining({
        content: expect.objectContaining({ heroTitle: 'Novo título hero' }),
        seoTitle: 'SEO custom',
      }),
    );
    expect(webRevalidator.revalidate).toHaveBeenCalledWith({
      paths: ['/sobre'],
      layoutPaths: ['/'],
      tags: ['public:institutional:sobre'],
    });
  });

  it('sets publishedAt when publishing a draft page', async () => {
    const pageRepository = createMockPageRepository();
    const webRevalidator = createMockPublicWebRevalidator();
    const existing = createExistingPage(PageStatus.DRAFT);
    existing.layout.publishedAt = undefined;

    vi.mocked(pageRepository.findInstitutionalBySlug).mockResolvedValue(existing);
    vi.mocked(pageRepository.updateInstitutionalContent).mockResolvedValue({
      layout: {
        ...existing.layout,
        status: PageStatus.PUBLISHED,
        publishedAt: new Date('2026-06-17'),
        updatedAt: new Date('2026-06-17'),
      },
    });

    const useCase = new UpdateInstitutionalPage(pageRepository, webRevalidator);
    const result = await useCase.execute({
      slug: 'sobre',
      content: buildDefaultAboutPageContent(brand),
      status: PageStatus.PUBLISHED,
    });

    expect(result.status).toBe(PageStatus.PUBLISHED);
    expect(pageRepository.updateInstitutionalContent).toHaveBeenCalledWith(
      PAGE_ID,
      expect.objectContaining({
        status: PageStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      }),
    );
  });

  it('throws when institutional page is missing', async () => {
    const pageRepository = createMockPageRepository();
    vi.mocked(pageRepository.findInstitutionalBySlug).mockResolvedValue(null);

    const useCase = new UpdateInstitutionalPage(pageRepository, createMockPublicWebRevalidator());

    await expect(
      useCase.execute({
        slug: 'sobre',
        content: buildDefaultAboutPageContent(brand),
      }),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });

  it('rejects external traffic links via parseAboutPageContent at API boundary', () => {
    const content = buildDefaultAboutPageContent(brand);
    expect(() =>
      parseAboutPageContent({
        ...content,
        trafficDirection: {
          ...content.trafficDirection,
          links: [{ label: 'Bad', href: 'https://evil.com' }],
        },
      }),
    ).toThrow(ZodError);
  });
});
