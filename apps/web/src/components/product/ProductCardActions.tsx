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
  clickOrigin?: AffiliateClickOrigin;
  placement?: ClickPlacementValue;
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
  articleId,
  collectionId,
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
  const stackGap = editorial
    ? 'flex w-52 shrink-0 flex-col gap-2.5 self-end sm:self-auto'
    : compact
      ? 'space-y-1'
      : 'space-y-2';
  const buttonClass = editorial
    ? 'px-5 py-2.5 text-sm'
    : compact
      ? 'px-3 py-1.5 text-xs'
      : 'px-4 py-2.5 text-xs';
  const primaryButtonClass = editorial
    ? 'px-5 py-2.5 text-sm'
    : compact
      ? 'px-3 py-1.5 text-xs'
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
          articleId={articleId}
          collectionId={collectionId}
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
            editorial ? 'text-center text-sm' : 'block text-center',
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
