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
  /** Editorial embed: fixed-width stacked CTAs on the right column of the card. */
  editorial?: boolean;
};

export function ProductCardActions({
  product,
  sessionId,
  blockId,
  clickOrigin = 'listagem',
  utmDefaults,
  className,
  compact = false,
  editorial = false,
}: ProductCardActionsProps): React.JSX.Element {
  const isStale = product.price.isStale || product.price.amount === null;
  const marketplace = marketplaceLabel(product.marketplace);
  const detailHref = `/produtos/${product.slug}`;
  const stackGap = editorial
    ? 'flex w-44 shrink-0 flex-col gap-2 self-end sm:self-auto'
    : compact
      ? 'space-y-1'
      : 'space-y-2';
  const buttonClass = editorial
    ? 'px-4 py-2 text-xs'
    : compact
      ? 'px-3 py-1.5 text-[11px]'
      : 'px-4 py-2.5 text-xs';
  const primaryButtonClass = editorial
    ? 'px-4 py-2 text-xs'
    : compact
      ? 'px-3 py-1.5 text-[11px]'
      : 'px-4 py-2.5 text-xs';
  const widthClass = 'w-full';

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
          className={cn(widthClass, primaryButtonClass)}
        >
          Ver preço na {marketplace}
        </AffiliateGoLink>
        <Link
          href={detailHref}
          className={cn(
            'text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline',
            editorial ? 'text-center' : 'block text-center',
          )}
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
          'inline-flex items-center justify-center rounded-full bg-[var(--primary)] text-center font-semibold text-white transition-colors hover:opacity-90',
          widthClass,
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
        className={cn(widthClass, buttonClass)}
      >
        Ver preço na {marketplace} ↗
      </AffiliateGoLink>
    </div>
  );
}
