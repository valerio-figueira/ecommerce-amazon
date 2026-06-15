import { describe, expect, it } from 'vitest';

import {
  extractAllEmbedSlugsFromBody,
  extractCompareSlugGroupsFromBody,
  extractProductSlugsFromBody,
  parseArticleShortcodes,
  parseCompareSlugs,
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

  it('parses compare slugs from raw string', () => {
    expect(parseCompareSlugs('slug-a, slug-b ,INVALID,slug-c')).toEqual([
      'slug-a',
      'slug-b',
      'slug-c',
    ]);
  });

  it('extracts compare slug groups from body', () => {
    const body =
      '[[compare:cadeira-ergonomica-home-office,headset-gamer-7-1]]<p>Meio</p>[[compare:mouse-gamer,rgb-keyboard,webcam-hd]]';
    expect(extractCompareSlugGroupsFromBody(body)).toEqual([
      ['cadeira-ergonomica-home-office', 'headset-gamer-7-1'],
      ['mouse-gamer', 'rgb-keyboard', 'webcam-hd'],
    ]);
  });

  it('extracts all embed slugs deduplicated from product and compare shortcodes', () => {
    const body =
      '[[product:cadeira-ergonomica-home-office]][[compare:cadeira-ergonomica-home-office,headset-gamer-7-1]]';
    expect(extractAllEmbedSlugsFromBody(body)).toEqual([
      'cadeira-ergonomica-home-office',
      'headset-gamer-7-1',
    ]);
  });

  it('parses mixed html, product and compare segments in order', () => {
    const body =
      '<p>Intro</p>[[product:cadeira-ergonomica-home-office]]<p>Compare</p>[[compare:headset-gamer-7-1,mouse-gamer]]<p>Fim</p>';
    expect(parseArticleShortcodes(body)).toEqual([
      { type: 'html', html: '<p>Intro</p>' },
      { type: 'product', slug: 'cadeira-ergonomica-home-office' },
      { type: 'html', html: '<p>Compare</p>' },
      { type: 'compare', slugs: ['headset-gamer-7-1', 'mouse-gamer'] },
      { type: 'html', html: '<p>Fim</p>' },
    ]);
  });
});
