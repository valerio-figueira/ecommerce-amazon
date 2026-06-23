'use client';

import { ProductCard } from '@/components/product/ProductCard';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import type { ProductDetailDto } from '@/lib/api/schemas';

type ProductDetailEmbedProps = {
  slug: string;
  product: ProductDetailDto | null;
};

export function ProductDetailEmbed({
  slug: _slug,
  product,
}: ProductDetailEmbedProps): React.JSX.Element {
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
        placement={ClickPlacement.PRODUCT_DETAIL_EMBED}
        pros={product.pros}
        cons={product.cons}
      />
    </div>
  );
}
