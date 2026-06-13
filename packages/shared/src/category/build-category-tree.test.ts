import { describe, expect, it } from 'vitest';

import { buildCategoryTree, flattenCategoryTree } from './build-category-tree.js';

describe('buildCategoryTree', () => {
  it('builds nested tree ordered by sortOrder', () => {
    const tree = buildCategoryTree([
      { id: '1', slug: 'games', label: 'Games', parentId: null, sortOrder: 1 },
      { id: '2', slug: 'home-office', label: 'Home Office', parentId: null, sortOrder: 0 },
      {
        id: '3',
        slug: 'perifericos',
        label: 'Periféricos',
        parentId: '1',
        sortOrder: 0,
      },
    ]);

    expect(tree.map((node) => node.slug)).toEqual(['home-office', 'games']);
    expect(tree[1]?.subcategories?.[0]?.slug).toBe('perifericos');
  });
});

describe('flattenCategoryTree', () => {
  it('returns depth for each node', () => {
    const tree = buildCategoryTree([
      { id: '1', slug: 'games', label: 'Games', parentId: null, sortOrder: 0 },
      {
        id: '2',
        slug: 'perifericos',
        label: 'Periféricos',
        parentId: '1',
        sortOrder: 0,
      },
    ]);

    const flat = flattenCategoryTree(tree);
    expect(flat).toEqual([
      expect.objectContaining({ slug: 'games', depth: 0 }),
      expect.objectContaining({ slug: 'perifericos', depth: 1 }),
    ]);
  });
});
