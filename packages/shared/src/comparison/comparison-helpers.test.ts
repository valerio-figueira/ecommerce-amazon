import { describe, expect, it } from 'vitest';

import {
  buildSuggestedComparisonSlug,
  countEditorialWords,
  isComparisonShareToken,
} from './comparison-helpers.js';

describe('isComparisonShareToken', () => {
  it('accepts UUID v4', () => {
    expect(isComparisonShareToken('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects slug-like values', () => {
    expect(isComparisonShareToken('cadeira-a-vs-cadeira-b')).toBe(false);
  });
});

describe('countEditorialWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countEditorialWords('one two three')).toBe(3);
  });
});

describe('buildSuggestedComparisonSlug', () => {
  it('joins product titles with -vs-', () => {
    expect(buildSuggestedComparisonSlug(['Cadeira A', 'Cadeira B'])).toBe('cadeira-a-vs-cadeira-b');
  });
});
