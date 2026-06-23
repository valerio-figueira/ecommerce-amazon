import { describe, expect, it } from 'vitest';

import type { ProductListItemDto } from '@/lib/api/types';

import { resolveEditorialBadge } from './product-badges';

function baseProduct(overrides: Partial<ProductListItemDto> = {}): ProductListItemDto {
  return {
    id: 'a1111111-1111-4111-8111-111111111111',
    slug: 'produto-teste',
    title: 'Produto teste',
    marketplace: 'amazon_br',
    price: {
      amount: 999,
      currency: 'BRL',
      isStale: false,
      updatedAt: new Date().toISOString(),
    },
    editorialScore: 70,
    visible: true,
    goUrl: '/go/produto-teste',
    ...overrides,
  };
}

describe('resolveEditorialBadge', () => {
  it('shows Top avaliado when rating is at least 4.9 with enough reviews', () => {
    const badge = resolveEditorialBadge(
      baseProduct({ rating: 4.9, reviewCount: 50, editorialScore: 70 }),
    );
    expect(badge).toEqual({ type: 'top_rated', label: 'Top avaliado' });
  });

  it('does not show Top avaliado when rating is below 4.9', () => {
    const badge = resolveEditorialBadge(
      baseProduct({ rating: 4.8, reviewCount: 100, editorialScore: 70 }),
    );
    expect(badge).toBeNull();
  });

  it('does not show Top avaliado when review count is below minimum', () => {
    const badge = resolveEditorialBadge(
      baseProduct({ rating: 5, reviewCount: 49, editorialScore: 70 }),
    );
    expect(badge).toBeNull();
  });
});
