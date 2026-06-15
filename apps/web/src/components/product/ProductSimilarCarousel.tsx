import Link from 'next/link';

import { ProductCard } from '@/components/product/ProductCard';
import type { ProductListItemDto } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

type ProductSimilarCarouselProps = {
  products: ProductListItemDto[];
  categorySlug?: string | undefined;
  categoryLabel?: string | undefined;
};

const SLIDE_CLASS =
  'snap-start shrink-0 w-[62%] max-w-[210px] sm:w-[38%] md:w-[calc(28%-0.667rem)] lg:w-[calc(22%-0.75rem)]';

export function ProductSimilarCarousel({
  products,
  categorySlug,
  categoryLabel,
}: ProductSimilarCarouselProps): React.JSX.Element | null {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-8" aria-label="Produtos similares">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-2xl font-bold text-neutral-900">Produtos similares</h2>
        {categorySlug && categoryLabel ? (
          <Link
            href={`/categorias/${categorySlug}`}
            className="text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
          >
            Ver todos em {categoryLabel}
          </Link>
        ) : null}
      </div>

      <div
        className={cn(
          '-mx-4 flex items-stretch gap-3 overflow-x-auto px-4 pb-2',
          'snap-x snap-mandatory',
          'md:mx-0 md:px-0',
        )}
      >
        {products.map((product) => (
          <div key={product.id} className={cn(SLIDE_CLASS, 'flex py-1')}>
            <ProductCard
              product={product}
              clickOrigin="similar"
              variant="compact"
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      {products.length > 1 ? (
        <p className="mt-3 text-center text-xs text-neutral-400 md:hidden">
          Arraste para ver mais produtos
        </p>
      ) : null}
    </section>
  );
}
