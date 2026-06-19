'use client';

import { useEffect, useState } from 'react';

import { PriceDisplay } from '@/components/product/PriceDisplay';
import type { ProductDetailDto } from '@/lib/api/schemas';

type ComparisonVolatilePriceProps = {
  product: ProductDetailDto;
  compact?: boolean;
};

export function ComparisonVolatilePrice({
  product,
  compact = false,
}: ComparisonVolatilePriceProps): React.JSX.Element {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <span className="inline-block min-w-[4rem] text-neutral-400">—</span>;
  }

  return (
    <PriceDisplay price={product.price} strikethrough={product.price.strikethrough} compact={compact} />
  );
}
