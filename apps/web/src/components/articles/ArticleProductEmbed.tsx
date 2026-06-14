'use client';

import { ProductCard } from '@/components/product/ProductCard';
import type { ProductListItemDto } from '@/lib/api/types';

type ArticleProductEmbedProps = {
  slug: string;
  product: ProductListItemDto | null;
};

export function ArticleProductEmbed({
  slug,
  product,
}: ArticleProductEmbedProps): React.JSX.Element {
  if (!product) {
    return (
      <div className="rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
        Produto &quot;{slug}&quot; indisponível no catálogo local.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ProductCard product={product} variant="compact" clickOrigin="embed" />
      <p className="text-xs text-neutral-500">
        Links de afiliado: ao clicar em &quot;Ver preço&quot;, você será direcionado ao marketplace
        parceiro. Podemos receber comissão sem custo extra para você.
      </p>
    </div>
  );
}
