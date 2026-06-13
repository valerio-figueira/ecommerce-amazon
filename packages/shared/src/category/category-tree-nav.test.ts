import { describe, expect, it } from 'vitest';

import type { CategoryNavNode } from './category-tree-nav.js';
import {
  findCategoryNodeBySlug,
  getAncestorSlugs,
  getDirectChildren,
  getRootSlugForCategory,
  isCategoryDescendantOf,
} from './category-tree-nav.js';

const tree: CategoryNavNode[] = [
  {
    slug: 'home-office',
    label: 'Home Office',
    subcategories: [
      { slug: 'office-desk', label: 'Office Desk' },
      { slug: 'cadeiras', label: 'Cadeiras Ergonômicas' },
    ],
  },
  {
    slug: 'games',
    label: 'Games',
    subcategories: [
      {
        slug: 'perifericos',
        label: 'Periféricos',
        subcategories: [{ slug: 'teclados', label: 'Teclados' }],
      },
      { slug: 'consoles', label: 'Consoles' },
    ],
  },
];

describe('findCategoryNodeBySlug', () => {
  it('finds nested nodes', () => {
    expect(findCategoryNodeBySlug(tree, 'teclados')?.label).toBe('Teclados');
  });

  it('returns null for unknown slug', () => {
    expect(findCategoryNodeBySlug(tree, 'unknown')).toBeNull();
  });
});

describe('getDirectChildren', () => {
  it('returns immediate children only', () => {
    expect(getDirectChildren(tree, 'games').map((node) => node.slug)).toEqual([
      'perifericos',
      'consoles',
    ]);
  });

  it('returns empty array for leaf nodes', () => {
    expect(getDirectChildren(tree, 'teclados')).toEqual([]);
  });
});

describe('getAncestorSlugs', () => {
  it('returns ancestor slugs from root to parent', () => {
    expect(getAncestorSlugs(tree, 'teclados')).toEqual(['games', 'perifericos']);
  });

  it('returns empty array for root nodes', () => {
    expect(getAncestorSlugs(tree, 'games')).toEqual([]);
  });
});

describe('getRootSlugForCategory', () => {
  it('returns root slug for nested category', () => {
    expect(getRootSlugForCategory(tree, 'office-desk')).toBe('home-office');
  });

  it('returns own slug for root category', () => {
    expect(getRootSlugForCategory(tree, 'games')).toBe('games');
  });
});

describe('isCategoryDescendantOf', () => {
  it('detects descendants and self', () => {
    expect(isCategoryDescendantOf(tree, 'games', 'teclados')).toBe(true);
    expect(isCategoryDescendantOf(tree, 'games', 'games')).toBe(true);
    expect(isCategoryDescendantOf(tree, 'games', 'office-desk')).toBe(false);
  });
});
