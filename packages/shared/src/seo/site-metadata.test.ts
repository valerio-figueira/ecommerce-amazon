import { describe, expect, it } from 'vitest';

import { createBrandConfig } from '../config/brand.js';
import {
  buildFacetedListingMetadata,
  buildNotFoundMetadata,
  buildPageCanonical,
  buildRootMetadata,
  hasArticleFacetParams,
  hasCategoryFacetParams,
  parseListingPage,
} from './site-metadata.js';

const brand = createBrandConfig({
  SITE_NAME: 'Vitrine Test',
  WEB_PUBLIC_URL: 'https://vitrine.example',
});

describe('site-metadata', () => {
  it('builds root metadata with template and metadataBase', () => {
    const metadata = buildRootMetadata(brand);
    expect(metadata.metadataBase?.toString()).toBe('https://vitrine.example/');
    expect(metadata.title).toEqual({
      default: 'Vitrine Test — Curadoria inteligente',
      template: '%s | Vitrine Test',
    });
    expect(metadata.openGraph?.siteName).toBe('Vitrine Test');
  });

  it('builds clean canonical without query params', () => {
    expect(buildPageCanonical('/categorias/eletronicos', brand)).toBe(
      'https://vitrine.example/categorias/eletronicos',
    );
  });

  it('builds not found metadata with noindex', () => {
    const metadata = buildNotFoundMetadata('Página não encontrada');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('noindexes faceted listing when page > 1', () => {
    const metadata = buildFacetedListingMetadata({
      title: 'Eletrônicos',
      description: 'Desc',
      canonicalPath: '/categorias/eletronicos',
      brand,
      page: 2,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(
      'https://vitrine.example/categorias/eletronicos',
    );
  });

  it('noindexes faceted listing when sort param present', () => {
    const metadata = buildFacetedListingMetadata({
      title: 'Eletrônicos',
      description: 'Desc',
      canonicalPath: '/categorias/eletronicos',
      brand,
      hasFacetParams: true,
    });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('detects category facet params', () => {
    expect(hasCategoryFacetParams({ sort: 'price_asc' })).toBe(true);
    expect(hasCategoryFacetParams({ page: '1' })).toBe(false);
  });

  it('detects article facet params', () => {
    expect(hasArticleFacetParams({ q: 'mouse' })).toBe(true);
    expect(hasArticleFacetParams({ page: '1' })).toBe(false);
  });

  it('parses listing page safely', () => {
    expect(parseListingPage({ page: '3' })).toBe(3);
    expect(parseListingPage({})).toBe(1);
    expect(parseListingPage({ page: 'invalid' })).toBe(1);
  });
});
