import { describe, expect, it } from 'vitest';

import type { CategoryCascadeOption } from './resolve-cascade-category-id.js';
import {
  buildCascadePath,
  hasIncompleteCascadeSelection,
  isStoredCategoryIdValidLeaf,
  resolveLeafCategoryId,
} from './resolve-cascade-category-id.js';

const ROOT = 'root-id';
const L2 = 'l2-id';
const L3 = 'l3-id';
const LEAF = 'leaf-id';

const options: CategoryCascadeOption[] = [
  { id: ROOT, isLeaf: false, parentId: null },
  { id: L2, isLeaf: false, parentId: ROOT },
  { id: L3, isLeaf: false, parentId: L2 },
  { id: LEAF, isLeaf: true, parentId: L3 },
  { id: 'leaf-l2-id', isLeaf: true, parentId: ROOT },
];

describe('buildCascadePath', () => {
  it('returns empty object when categoryId is undefined', () => {
    expect(buildCascadePath(undefined, options)).toEqual({});
  });

  it('builds full path for a deep leaf', () => {
    expect(buildCascadePath(LEAF, options)).toEqual({
      level1: ROOT,
      level2: L2,
      level3: L3,
      level4: LEAF,
    });
  });

  it('builds partial path for legacy root assignment', () => {
    expect(buildCascadePath(ROOT, options)).toEqual({ level1: ROOT });
  });
});

describe('resolveLeafCategoryId', () => {
  it('returns leaf at level 2 when only two levels are selected', () => {
    expect(
      resolveLeafCategoryId({ level1: ROOT, level2: 'leaf-l2-id' }, options),
    ).toBe('leaf-l2-id');
  });

  it('returns leaf at level 4 when full cascade is selected', () => {
    expect(
      resolveLeafCategoryId(
        { level1: ROOT, level2: L2, level3: L3, level4: LEAF },
        options,
      ),
    ).toBe(LEAF);
  });

  it('returns undefined when deepest selection is not a leaf', () => {
    expect(resolveLeafCategoryId({ level1: ROOT, level2: L2 }, options)).toBeUndefined();
  });

  it('returns undefined when cascade is empty', () => {
    expect(resolveLeafCategoryId({}, options)).toBeUndefined();
  });
});

describe('hasIncompleteCascadeSelection', () => {
  it('detects incomplete intermediate selection', () => {
    expect(hasIncompleteCascadeSelection({ level1: ROOT, level2: L2 }, options)).toBe(true);
  });

  it('returns false for completed leaf selection', () => {
    expect(
      hasIncompleteCascadeSelection(
        { level1: ROOT, level2: L2, level3: L3, level4: LEAF },
        options,
      ),
    ).toBe(false);
  });

  it('returns false when cascade is empty', () => {
    expect(hasIncompleteCascadeSelection({}, options)).toBe(false);
  });
});

describe('isStoredCategoryIdValidLeaf', () => {
  it('accepts undefined categoryId', () => {
    expect(isStoredCategoryIdValidLeaf(undefined, options)).toBe(true);
  });

  it('rejects legacy root categoryId', () => {
    expect(isStoredCategoryIdValidLeaf(ROOT, options)).toBe(false);
  });

  it('accepts valid leaf categoryId', () => {
    expect(isStoredCategoryIdValidLeaf(LEAF, options)).toBe(true);
  });
});
