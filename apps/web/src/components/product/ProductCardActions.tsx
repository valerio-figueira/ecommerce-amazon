'use client';

import Link from 'next/link';

import {
  AffiliateGoLink,
  type AffiliateClickOrigin,
} from '@/components/product/AffiliateGoLink';
import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';
import type { ProductListItemDto } from '@/lib/api/types';
import { marketplaceLabel } from '@/lib/format';
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
  const marketplace = marketplaceLabel(product.marketplace);
  const detailHref = `/produtos/${product.slug}`;
  const editorialStackGap =
    'flex w-full flex-col items-stretch gap-2 sm:w-fit sm:items-start sm:gap-2.5';
  const stackGap = editorial
    ? editorialStackGap
    : compact
      ? 'space-y-1'
      : 'space-y-2';
  const editorialButtonClass = 'px-4 py-2.5 text-sm';
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
  const widthClass = editorial ? 'w-full sm:w-auto sm:whitespace-nowrap' : 'w-full';

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
          Ver preço na {marketplace}
        </AffiliateGoLink>
        <Link
          href={detailHref}
          className={cn(
            'text-xs font-medium text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline',
            editorial ? 'text-center text-sm sm:text-left' : 'block text-center',
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
        articleId={articleId}
        collectionId={collectionId}
        comparisonSlug={comparisonSlug}
        origin={clickOrigin}
        {...(placement !== undefined ? { placement } : {})}
        {...(utmDefaults !== undefined ? { utmDefaults } : {})}
        variant="outline"
        className={cn(widthClass, buttonClass)}
      >
        Ver preço na {marketplace} ↗
      </AffiliateGoLink>
    </div>
  );
}
