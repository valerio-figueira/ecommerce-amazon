'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import type { ProductDetailDto } from '@/lib/api/schemas';

type ArticleProductEmbedProps = {
  slug: string;
  product: ProductDetailDto | null;
  articleId: string;
};

export function ArticleProductEmbed({
  slug: _slug,
  product,
  articleId,
}: ArticleProductEmbedProps): React.JSX.Element {
  if (!product) {
    return (
      <div
        className="rounded-[var(--radius)] border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6"
        role="status"
        aria-label="Produto indisponível"
      />
    );
  }

  return (
    <div className="min-w-0 w-full">
      <ProductCard
        product={product}
        variant="editorial"
        clickOrigin="embed"
        placement={ClickPlacement.ARTICLE_EMBED}
        articleId={articleId}
        pros={product.pros}
        cons={product.cons}
      />
    </div>
  );
}
