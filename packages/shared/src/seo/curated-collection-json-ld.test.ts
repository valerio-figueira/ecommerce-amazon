import { describe, expect, it } from 'vitest';

import {
  buildCuratedCollectionBreadcrumbJsonLd,
  buildCuratedCollectionJsonLd,
} from './curated-collection-json-ld.js';

describe('curated collection json-ld', () => {
  it('builds CollectionPage schema', () => {
    const jsonLd = buildCuratedCollectionJsonLd({
      siteBaseUrl: 'https://vitrine.example',
      slug: 'setup-gamer',
      title: 'Setup Gamer',
      description: 'Guia para iniciantes',
      productCount: 3,
      updatedAt: '2026-01-15T12:00:00.000Z',
    });

    expect(jsonLd['@type']).toBe('CollectionPage');
    expect(jsonLd['url']).toBe('https://vitrine.example/colecoes/setup-gamer');
    expect(jsonLd['numberOfItems']).toBe(3);
  });

  it('builds breadcrumb list', () => {
    const jsonLd = buildCuratedCollectionBreadcrumbJsonLd({
      siteBaseUrl: 'https://vitrine.example',
      slug: 'setup-gamer',
      title: 'Setup Gamer',
    });

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd['itemListElement']).toHaveLength(3);
  });
});
