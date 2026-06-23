'use client';

import Link from 'next/link';

import { AffiliateGoLink, type AffiliateClickOrigin } from '@/components/product/AffiliateGoLink';
import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';
import type { ProductListItemDto } from '@/lib/api/types';
import { affiliatePriceCtaLabel } from '@/lib/format';
import { cn } from '@/lib/utils';

type ProductCardActionsProps = {
  product: ProductListItemDto;
  sessionId?: string | undefined;
  blockId?: string | undefined;
  articleId?: string | undefined;
  collectionId?: string | undefined;
  comparisonSlug?: string | undefined;
  clickOrigin?: AffiliateClickOrigin;
  placement?: ClickPlacementValue;
  utmDefaults?: Record<string, string>;
  className?: string;
  compact?: boolean;
  /** Editorial embed: stacked CTAs below card content; capped width on desktop. */
  editorial?: boolean;
};

export function ProductCardActions({
  product,
  sessionId,
  blockId,
  articleId,
  collectionId,
  comparisonSlug,
  clickOrigin = 'listagem',
  placement,
  utmDefaults,
  className,
  compact = false,
  editorial = false,
}: ProductCardActionsProps): React.JSX.Element {
  const isStale = product.price.isStale || product.price.amount === null;
  const priceCtaLabel = affiliatePriceCtaLabel(product.marketplace);
  const detailHref = `/produtos/${product.slug}`;
  const editorialStackGap =
    'flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end sm:gap-2.5';
  const stackGap = editorial ? editorialStackGap : compact ? 'space-y-1' : 'space-y-2';
  const editorialButtonClass =
    'min-h-10 px-3 py-2 text-xs leading-snug sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-sm';
  const buttonClass = editorial
    ? editorialButtonClass
    : compact
      ? 'px-3 py-1.5 text-xs'
      : 'px-4 py-2.5 text-xs';
  const primaryButtonClass = editorial
    ? editorialButtonClass
    : compact
      ? 'px-3 py-1.5 text-xs'
      : 'px-4 py-2.5 text-xs';
  const widthClass = editorial
    ? 'w-full whitespace-normal text-center sm:min-w-[10.5rem] sm:whitespace-nowrap'
    : 'w-full';

  if (isStale) {
    return (
      <div className={cn(stackGap, className)}>
        <AffiliateGoLink
          productId={product.id}
          slug={product.slug}
          sessionId={sessionId}
          blockId={blockId}
          articleId={articleId}
          collectionId={collectionId}
          comparisonSlug={comparisonSlug}
          origin={clickOrigin}
          {...(placement !== undefined ? { placement } : {})}
          {...(utmDefaults !== undefined ? { utmDefaults } : {})}
          variant="primary"
          className={cn(widthClass, primaryButtonClass)}
        >
          {priceCtaLabel}
        </AffiliateGoLink>
        <Link
          href={detailHref}
          className={cn(
            'text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline',
            editorial ? 'block w-full text-center text-sm' : 'block text-center',
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
          'flex w-full items-center justify-center rounded-full bg-[var(--primary)] text-center font-semibold text-white transition-colors hover:opacity-90',
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
        articleId={articleId}
        collectionId={collectionId}
        comparisonSlug={comparisonSlug}
        origin={clickOrigin}
        {...(placement !== undefined ? { placement } : {})}
        {...(utmDefaults !== undefined ? { utmDefaults } : {})}
        variant="outline"
        className={cn(widthClass, buttonClass)}
      >
        {priceCtaLabel} ↗
      </AffiliateGoLink>
    </div>
  );
}
