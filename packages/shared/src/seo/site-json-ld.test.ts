import { describe, expect, it } from 'vitest';

import { createBrandConfig } from '../config/brand.js';
import {
  buildArticleJsonLd,
  buildCategoryProductItemListJsonLd,
  buildOrganizationJsonLd,
  buildSiteJsonLdGraph,
  buildWebSiteJsonLd,
} from './site-json-ld.js';

const brand = createBrandConfig({
  SITE_NAME: 'Vitrine Test',
  WEB_PUBLIC_URL: 'https://vitrine.example',
});

describe('site json-ld', () => {
  it('builds organization schema', () => {
    const jsonLd = buildOrganizationJsonLd(brand);
    expect(jsonLd['@type']).toBe('Organization');
    expect(jsonLd['name']).toBe('Vitrine Test');
    expect(jsonLd['legalName']).toBeTruthy();
  });

  it('builds website schema with search action', () => {
    const jsonLd = buildWebSiteJsonLd(brand);
    expect(jsonLd['@type']).toBe('WebSite');
    const action = jsonLd['potentialAction'] as Record<string, unknown>;
    expect(action['@type']).toBe('SearchAction');
  });

  it('builds site graph', () => {
    const jsonLd = buildSiteJsonLdGraph(brand);
    expect(jsonLd['@graph']).toHaveLength(2);
  });

  it('builds category product item list', () => {
    const jsonLd = buildCategoryProductItemListJsonLd({
      siteBaseUrl: 'https://vitrine.example',
      categoryLabel: 'Teclados',
      products: [
        { slug: 'teclado-a', title: 'Teclado A' },
        { slug: 'teclado-b', title: 'Teclado B' },
      ],
    });
    expect(jsonLd['@type']).toBe('ItemList');
    const items = jsonLd['itemListElement'] as Array<Record<string, unknown>>;
    expect(items[0]?.['url']).toBe('https://vitrine.example/produtos/teclado-a');
  });

  it('builds article schema with publisher and dateModified', () => {
    const jsonLd = buildArticleJsonLd({
      siteBaseUrl: 'https://vitrine.example',
      brand,
      slug: 'melhores-mouses',
      title: 'Melhores Mouses',
      excerpt: 'Guia completo.',
      publishedAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-06-01T00:00:00.000Z',
      coverImageUrl: 'https://cdn.example/cover.jpg',
      categoryName: 'Periféricos',
    });
    const graph = jsonLd['@graph'] as Array<Record<string, unknown>>;
    const article = graph[0]!;
    expect(article['@type']).toBe('Article');
    expect(article['dateModified']).toBe('2025-06-01T00:00:00.000Z');
    expect(article['url']).toBe('https://vitrine.example/artigos/melhores-mouses');
    expect((article['publisher'] as Record<string, unknown>)['@type']).toBe('Organization');
  });
});
