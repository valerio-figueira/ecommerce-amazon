import { describe, expect, it } from 'vitest';

import {
  buildCategoryBreadcrumbJsonLd,
  buildCategoryCollectionJsonLd,
} from './category-json-ld.js';

describe('category json-ld', () => {
  const input = {
    siteBaseUrl: 'https://vitrine.example',
    slug: 'teclados-mecanicos',
    label: 'Teclados Mecânicos',
    seoDescription: 'Melhores teclados mecânicos curados.',
    breadcrumbs: [
      { slug: 'games', label: 'Games' },
      { slug: 'perifericos', label: 'Periféricos' },
      { slug: 'teclados-mecanicos', label: 'Teclados Mecânicos' },
    ],
    productCount: 12,
  };

  it('builds breadcrumb list', () => {
    const jsonLd = buildCategoryBreadcrumbJsonLd(input);
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd['itemListElement']).toHaveLength(4);
  });

  it('builds collection page', () => {
    const jsonLd = buildCategoryCollectionJsonLd(input);
    expect(jsonLd['@type']).toBe('CollectionPage');
    expect(jsonLd['url']).toBe('https://vitrine.example/categorias/teclados-mecanicos');
    expect(jsonLd['numberOfItems']).toBe(12);
  });
});
