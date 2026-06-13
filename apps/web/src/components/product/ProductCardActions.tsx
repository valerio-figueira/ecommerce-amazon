'use client';

import Link from 'next/link';

import { AffiliateGoLink } from '@/components/product/AffiliateGoLink';
import type { ProductListItemDto } from '@/lib/api/types';
import { marketplaceLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

type ProductCardActionsProps = {
  product: ProductListItemDto;
  sessionId?: string | undefined;
  blockId?: string | undefined;
  className?: string;
};

export function ProductCardActions({
  product,
  sessionId,
  blockId,
  className,
}: ProductCardActionsProps): React.JSX.Element {
  const isStale = product.price.isStale || product.price.amount === null;
  const marketplace = marketplaceLabel(product.marketplace);
  const detailHref = `/produtos/${product.slug}`;

  if (isStale) {
    return (
      <div className={cn('mt-auto space-y-2', className)}>
        <AffiliateGoLink
          productId={product.id}
          slug={product.slug}
          sessionId={sessionId}
          blockId={blockId}
          variant="primary"
        >
          Ver preço na {marketplace}
        </AffiliateGoLink>
        <Link
          href={detailHref}
          className="block text-center text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline"
        >
          Ver análise
        </Link>
      </div>
    );
  }

  return (
    <div className={cn('mt-auto space-y-2', className)}>
      <Link
        href={detailHref}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:opacity-90"
      >
        Ver análise e ofertas
      </Link>
      <AffiliateGoLink
        productId={product.id}
        slug={product.slug}
        sessionId={sessionId}
        blockId={blockId}
        variant="outline"
      >
        Ver preço na {marketplace} ↗
      </AffiliateGoLink>
    </div>
  );
}
