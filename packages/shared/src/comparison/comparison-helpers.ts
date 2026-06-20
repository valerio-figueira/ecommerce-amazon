import { slugifyTitle } from '../marketplace/slugify-title.js';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isComparisonShareToken(value: string): boolean {
  return UUID_V4_PATTERN.test(value);
}

export function countEditorialWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).filter((word) => word.length > 0).length;
}

export function buildSuggestedComparisonSlug(titles: string[]): string {
  if (titles.length === 0) return '';
  if (titles.length === 1) {
    return slugifyTitle(titles[0] ?? '').slice(0, 100);
  }

  const parts = titles.slice(0, 3).map((title) => slugifyTitle(title));
  const slug = parts.join('-vs-');
  return slug.slice(0, 100).replace(/-+$/u, '');
}

export const MIN_EDITORIAL_WORDS = 150;
export const MIN_CAROUSEL_ITEMS = 3;
