import { describe, expect, it } from 'vitest';

import {
  extractProductSlugsFromBody,
  parseArticleShortcodes,
} from './article-shortcodes.js';

describe('article shortcodes', () => {
  it('extracts unique product slugs from body', () => {
    const body =
      '<p>Intro</p>[[product:cadeira-ergonomica-home-office]]<p>Meio</p>[[product:headset-gamer-7-1]]';
    expect(extractProductSlugsFromBody(body)).toEqual([
      'cadeira-ergonomica-home-office',
      'headset-gamer-7-1',
    ]);
  });

  it('parses html and product segments in order', () => {
    const body =
      '<p>Antes</p>[[product:cadeira-ergonomica-home-office]]<p>Depois</p>';
    expect(parseArticleShortcodes(body)).toEqual([
      { type: 'html', html: '<p>Antes</p>' },
      { type: 'product', slug: 'cadeira-ergonomica-home-office' },
      { type: 'html', html: '<p>Depois</p>' },
    ]);
  });
});
