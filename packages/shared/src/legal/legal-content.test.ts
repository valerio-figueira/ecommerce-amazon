import { describe, expect, it } from 'vitest';

import { createBrandConfig } from '../config/brand.js';
import { buildLegalPageContent, buildLegalPageMetadata } from './legal-content.js';

describe('legal content', () => {
  const brand = createBrandConfig({
    SITE_NAME: 'Minha Vitrine',
    COMPANY_LEGAL_NAME: 'Minha Vitrine Ltda',
    CONTACT_EMAIL: 'privacidade@example.com',
    WEB_PUBLIC_URL: 'https://example.com',
  });

  it('builds all legal sections with brand placeholders', () => {
    const content = buildLegalPageContent(brand);

    expect(content.sections).toHaveLength(4);
    expect(content.sections.map((section) => section.id)).toEqual([
      'privacidade',
      'termos',
      'afiliados',
      'cookies',
    ]);
    expect(content.intro).toContain('Minha Vitrine');
    expect(content.intro).toContain('Minha Vitrine Ltda');
    expect(content.sections[0]?.subsections?.[0]?.listItems?.[0]).toContain('cookie técnico');
    expect(content.sections[3]?.subsections?.[0]?.listItems?.[0]).toContain('vitrine_session');
    expect(content.sections[2]?.paragraphs[0]).toContain('Amazon Associados');
  });

  it('builds metadata with canonical legal URL', () => {
    const metadata = buildLegalPageMetadata(brand);

    expect(metadata.alternates.canonical).toBe('https://example.com/legal');
    expect(metadata.description).toContain('Minha Vitrine');
    expect(metadata.openGraph.url).toBe('https://example.com/legal');
  });
});
