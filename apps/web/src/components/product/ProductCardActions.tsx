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
  clickOrigin?: 'listagem' | 'detalhe' | 'embed' | 'comparador' | 'cupons' | 'coleção';
  utmDefaults?: Record<string, string>;
  className?: string;
  compact?: boolean;
};

export function ProductCardActions({
  product,
  sessionId,
  blockId,
  clickOrigin = 'listagem',
  utmDefaults,
  className,
  compact = false,
}: ProductCardActionsProps): React.JSX.Element {
  const isStale = product.price.isStale || product.price.amount === null;
  const marketplace = marketplaceLabel(product.marketplace);
  const detailHref = `/produtos/${product.slug}`;
  const stackGap = compact ? 'space-y-1' : 'space-y-2';
  const buttonClass = compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';
  const primaryButtonClass = compact ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs';

  if (isStale) {
    return (
      <div className={cn(stackGap, className)}>
        <AffiliateGoLink
          productId={product.id}
          slug={product.slug}
          sessionId={sessionId}
          blockId={blockId}
          origin={clickOrigin}
          {...(utmDefaults !== undefined ? { utmDefaults } : {})}
          variant="primary"
          className={primaryButtonClass}
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
    <div className={cn(stackGap, className)}>
      <Link
        href={detailHref}
        className={cn(
          'inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] text-center font-semibold text-white transition-colors hover:opacity-90',
          primaryButtonClass,
        )}
      >
        Ver análise e ofertas
      </Link>
      <AffiliateGoLink
        productId={product.id}
        slug={product.slug}
        sessionId={sessionId}
        blockId={blockId}
        origin={clickOrigin}
        {...(utmDefaults !== undefined ? { utmDefaults } : {})}
        variant="outline"
        className={buttonClass}
      >
        Ver preço na {marketplace} ↗
      </AffiliateGoLink>
    </div>
  );
}
