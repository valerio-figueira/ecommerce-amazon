import { describe, expect, it } from 'vitest';

import { createBrandConfig } from '../config/brand.js';
import {
  buildDefaultAboutPageContent,
  buildAboutPageMetadata,
  parseAboutPageContent,
  resolveAboutPageContent,
} from './about-content.js';
import { sanitizeInstitutionalHtml } from './sanitize-institutional-html.js';

describe('about content', () => {
  const brand = createBrandConfig({
    SITE_NAME: 'Minha Vitrine',
    SITE_TAGLINE: 'Curadoria de confiança',
    WEB_PUBLIC_URL: 'https://example.com',
  });

  it('builds default sections with brand placeholders', () => {
    const content = buildDefaultAboutPageContent(brand);

    expect(content.sections).toHaveLength(4);
    expect(content.sections.map((section) => section.id)).toEqual([
      'proposta',
      'metodo',
      'afiliados',
      'equipe',
    ]);
    expect(content.heroIntro).toContain('Minha Vitrine');
    expect(content.sections[2]?.callout).toBe(true);
    expect(content.trafficDirection.links).toHaveLength(1);
    expect(content.trafficDirection.links[0]?.href).toBe('/artigos');
  });

  it('resolves partial CMS content over defaults', () => {
    const resolved = resolveAboutPageContent({ heroTitle: 'Título customizado' }, brand);
    expect(resolved.heroTitle).toBe('Título customizado');
    expect(resolved.sections).toHaveLength(4);
  });

  it('builds metadata with canonical sobre URL', () => {
    const metadata = buildAboutPageMetadata(brand);
    expect(metadata.alternates.canonical).toBe('https://example.com/sobre');
  });

  it('rejects external traffic links on parse', () => {
    const content = buildDefaultAboutPageContent(brand);
    expect(() =>
      parseAboutPageContent({
        ...content,
        trafficDirection: {
          ...content.trafficDirection,
          links: [{ label: 'Bad', href: 'https://evil.com' }],
        },
      }),
    ).toThrow();
  });
});

describe('sanitizeInstitutionalHtml', () => {
  it('strips script tags', () => {
    expect(sanitizeInstitutionalHtml('<p>ok</p><script>alert(1)</script>')).not.toContain('script');
  });

  it('preserves strong tags', () => {
    expect(sanitizeInstitutionalHtml('<strong>destaque</strong>')).toContain('<strong>');
  });

  it('removes onclick handlers', () => {
    expect(sanitizeInstitutionalHtml('<a href="/x" onclick="alert(1)">link</a>')).not.toContain(
      'onclick',
    );
  });
});
