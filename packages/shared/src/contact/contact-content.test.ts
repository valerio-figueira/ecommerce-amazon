import { describe, expect, it } from 'vitest';

import { createBrandConfig } from '../config/brand.js';
import {
  buildDefaultContactPageContent,
  listContactSocialEntries,
  normalizeContactSocialLinks,
  parseContactPageContent,
  resolveContactPageContent,
} from './contact-content.js';

describe('contact content', () => {
  const brand = createBrandConfig({
    SITE_NAME: 'Minha Vitrine',
    WEB_PUBLIC_URL: 'https://example.com',
    SITE_SOCIAL_INSTAGRAM: 'https://instagram.com/minhavitrine',
    SITE_SOCIAL_TELEGRAM: 'https://t.me/minhavitrine',
  });

  it('builds default content with brand social links', () => {
    const content = buildDefaultContactPageContent(brand);

    expect(content.socialLinks.instagram).toBe('https://instagram.com/minhavitrine');
    expect(content.socialLinks.telegram).toBe('https://t.me/minhavitrine');
    expect(content.socialsEnabled).toBe(true);
    expect(content.showOnHome).toBe(true);
  });

  it('resolves partial CMS content over defaults', () => {
    const resolved = resolveContactPageContent(
      {
        title: 'Fale conosco',
        socialsEnabled: false,
      },
      brand,
    );

    expect(resolved.title).toBe('Fale conosco');
    expect(resolved.socialsEnabled).toBe(false);
    expect(resolved.showOnHome).toBe(true);
    expect(resolved.socialLinks.instagram).toBe('https://instagram.com/minhavitrine');
  });

  it('normalizes empty social URLs on parse', () => {
    const parsed = parseContactPageContent({
      ...buildDefaultContactPageContent(brand),
      socialLinks: {
        instagram: 'https://instagram.com/minhavitrine',
        telegram: '',
        linkedin: '   ',
        x: 'https://x.com/minhavitrine',
      },
    });

    expect(parsed.socialLinks).toEqual({
      instagram: 'https://instagram.com/minhavitrine',
      x: 'https://x.com/minhavitrine',
    });
  });

  it('lists social entries in stable order', () => {
    const entries = listContactSocialEntries({
      telegram: 'https://t.me/minhavitrine',
      instagram: 'https://instagram.com/minhavitrine',
    });

    expect(entries).toEqual([
      ['instagram', 'https://instagram.com/minhavitrine'],
      ['telegram', 'https://t.me/minhavitrine'],
    ]);
  });
});
