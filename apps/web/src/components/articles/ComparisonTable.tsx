'use client';

import { ComparisonTableCore } from '@/components/comparison/comparison-table-core';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import type { ProductDetailDto } from '@/lib/api/schemas';

type ComparisonTableProps = {
  slugs: string[];
  products: (ProductDetailDto | null)[];
  articleId: string;
};

export function ComparisonTable({
  slugs,
  products,
  articleId,
}: ComparisonTableProps): React.JSX.Element {
  const { sessionId } = useWishlist();

  if (slugs.length < 2 || slugs.length > 3) {
    return (
      <div className="rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
        A tabela comparativa precisa de 2 a 3 produtos. Verifique o shortcode{' '}
        <code className="text-xs">[[compare:slug-1,slug-2]]</code>.
      </div>
    );
  }

  return (
    <ComparisonTableCore
      slugs={slugs}
      products={products}
      sessionId={sessionId}
      clickOrigin="comparador"
      placement={ClickPlacement.ARTICLE_COMPARISON}
      articleId={articleId}
    />
  );
}
