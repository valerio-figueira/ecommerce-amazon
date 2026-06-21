import { describe, expect, it } from 'vitest';

import {
  BRAND_DEFAULTS,
  createBrandConfig,
  formatAdminPageTitle,
  formatCopyrightNotice,
  formatEditorialTeamName,
  formatWebHomeTitle,
  formatWebPageTitle,
  getClientBrandConfig,
} from './brand.js';

describe('brand config', () => {
  it('uses defaults when env is empty', () => {
    const brand = createBrandConfig({});

    expect(brand.name).toBe(BRAND_DEFAULTS.name);
    expect(brand.legalName).toBe(BRAND_DEFAULTS.legalName);
    expect(brand.contactEmail).toBe(BRAND_DEFAULTS.contactEmail);
    expect(brand.tagline).toBe(BRAND_DEFAULTS.tagline);
    expect(brand.url).toBe('http://localhost:3001');
    expect(brand.socials).toEqual(BRAND_DEFAULTS.socials);
  });

  it('prefers SITE_NAME over NEXT_PUBLIC_SITE_NAME', () => {
    const brand = createBrandConfig({
      SITE_NAME: 'Marca Server',
      NEXT_PUBLIC_SITE_NAME: 'Marca Client',
    });

    expect(brand.name).toBe('Marca Server');
  });

  it('falls back to NEXT_PUBLIC_SITE_NAME when SITE_NAME is missing', () => {
    const brand = createBrandConfig({
      NEXT_PUBLIC_SITE_NAME: 'Marca Client',
    });

    expect(brand.name).toBe('Marca Client');
  });

  it('unescapes bash-quoted env values (Desk\\ Setup → Desk Setup)', () => {
    const brand = createBrandConfig({
      SITE_NAME: 'Desk\\ Setup',
    });

    expect(brand.name).toBe('Desk Setup');
  });

  it('unescapes bash-quoted NEXT_PUBLIC_SITE_NAME', () => {
    const brand = createBrandConfig({
      NEXT_PUBLIC_SITE_NAME: 'Desk\\ Setup',
    });

    expect(brand.name).toBe('Desk Setup');
  });

  it('getClientBrandConfig ignores server-only SITE_NAME for hydration-safe client bundles', () => {
    const brand = getClientBrandConfig({
      SITE_NAME: 'Marca Server',
      NEXT_PUBLIC_SITE_NAME: 'Marca Client',
    });

    expect(brand.name).toBe('Marca Client');
  });

  it('unifies WEB_PUBLIC_URL and NEXT_PUBLIC_SITE_URL', () => {
    expect(createBrandConfig({ WEB_PUBLIC_URL: 'https://a.example/' }).url).toBe(
      'https://a.example',
    );
    expect(createBrandConfig({ NEXT_PUBLIC_SITE_URL: 'https://b.example/' }).url).toBe(
      'https://b.example',
    );
    expect(
      createBrandConfig({
        WEB_PUBLIC_URL: 'https://a.example',
        NEXT_PUBLIC_SITE_URL: 'https://b.example',
      }).url,
    ).toBe('https://a.example');
  });

  it('treats empty URL env as unset (Docker ARG without value)', () => {
    expect(createBrandConfig({ WEB_PUBLIC_URL: '', NEXT_PUBLIC_SITE_URL: '' }).url).toBe(
      'http://localhost:3001',
    );
  });

  it('formats titles and copyright copy', () => {
    const brand = createBrandConfig({ SITE_NAME: 'Vitrine' });

    expect(formatWebPageTitle('Artigos', brand)).toBe('Artigos | Vitrine');
    expect(formatWebHomeTitle(brand)).toBe('Vitrine — Curadoria inteligente');
    expect(formatAdminPageTitle('Produtos', brand)).toBe('Produtos — Vitrine CMS');
    expect(formatEditorialTeamName(brand)).toBe('Redação Vitrine');
    expect(formatCopyrightNotice(brand, 2026)).toBe(
      '© 2026 Vitrine. Todos os direitos reservados.',
    );
  });
});
