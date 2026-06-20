'use client';

import { useState } from 'react';

import { ComparisonTableCore } from '@/components/comparison/comparison-table-core';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import type { ProductDetailDto } from '@/lib/api/schemas';

type StandaloneComparisonTableProps = {
  slugs: string[];
  products: (ProductDetailDto | null)[];
  comparisonSlug?: string | undefined;
};

export function StandaloneComparisonTable({
  slugs,
  products,
  comparisonSlug,
}: StandaloneComparisonTableProps): React.JSX.Element {
  const { sessionId, addItem, consentGranted, requestConsent } = useWishlist();
  const [addingAll, setAddingAll] = useState(false);

  if (slugs.length < 2 || slugs.length > 3) {
    return (
      <div className="rounded-[var(--radius)] border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
        Selecione de 2 a 3 produtos da mesma categoria para comparar.
      </div>
    );
  }

  const handleAddAll = async (): Promise<void> => {
    if (!consentGranted) {
      requestConsent();
      return;
    }

    setAddingAll(true);
    try {
      for (const product of products) {
        if (product) {
          await addItem(product.id);
        }
      }
    } finally {
      setAddingAll(false);
    }
  };

  return (
    <ComparisonTableCore
      slugs={slugs}
      products={products}
      sessionId={sessionId}
      clickOrigin="comparador"
      placement={ClickPlacement.COMPARISON_PAGE}
      comparisonSlug={comparisonSlug}
      showMarketplace
      footerExtra={
        <Button
          type="button"
          variant="outline"
          disabled={addingAll}
          onClick={() => void handleAddAll()}
        >
          {addingAll ? 'Adicionando...' : 'Adicionar todos à lista'}
        </Button>
      }
    />
  );
}
