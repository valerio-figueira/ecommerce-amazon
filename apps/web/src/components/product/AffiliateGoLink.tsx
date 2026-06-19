'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';

import { getAttribution } from '@/lib/attribution/context';
import { buildGoUrl } from '@/lib/go-url';
import { cn } from '@/lib/utils';

export type AffiliateClickOrigin =
  | 'listagem'
  | 'detalhe'
  | 'embed'
  | 'comparador'
  | 'cupons'
  | 'coleção'
  | 'similar';

type AffiliateGoLinkProps = {
  productId: string;
  slug: string;
  sessionId?: string | undefined;
  blockId?: string | undefined;
  articleId?: string | undefined;
  collectionId?: string | undefined;
  comparisonSlug?: string | undefined;
  origin?: AffiliateClickOrigin;
  placement?: ClickPlacementValue;
  pagePath?: string | undefined;
  referrerPath?: string | undefined;
  utmDefaults?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
};

export function AffiliateGoLink({
  slug,
  sessionId,
  blockId,
  articleId,
  collectionId,
  comparisonSlug,
  origin = 'listagem',
  placement,
  pagePath: pagePathProp,
  referrerPath,
  utmDefaults,
  className,
  children,
  variant = 'outline',
}: AffiliateGoLinkProps): React.JSX.Element {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const buildHref = (withClientTracking: boolean): string => {
    const attribution = withClientTracking ? getAttribution() : null;
    const resolvedBlockId = blockId ?? attribution?.blockId;
    const resolvedReferrerPath = referrerPath ?? attribution?.entryPath;
    const resolvedPagePath = pagePathProp ?? (withClientTracking ? pathname : undefined);
    const resolvedSessionId =
      withClientTracking && sessionId !== undefined && sessionId.length > 0
        ? sessionId
        : undefined;

    return buildGoUrl(slug, {
      ...(resolvedBlockId !== undefined ? { blockId: resolvedBlockId } : {}),
      ...(articleId !== undefined ? { articleId } : {}),
      ...(collectionId !== undefined ? { collectionId } : {}),
      ...(comparisonSlug !== undefined ? { comparisonSlug } : {}),
      ...(resolvedSessionId !== undefined ? { sessionId: resolvedSessionId } : {}),
      origin,
      ...(placement !== undefined ? { placement } : {}),
      ...(resolvedPagePath !== undefined ? { pagePath: resolvedPagePath } : {}),
      ...(resolvedReferrerPath !== undefined ? { referrerPath: resolvedReferrerPath } : {}),
      ...(utmDefaults !== undefined ? { utmDefaults } : {}),
    });
  };

  const href = buildHref(isMounted);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
    const trackedHref = buildHref(true);
    if (event.currentTarget.getAttribute('href') !== trackedHref) {
      event.currentTarget.href = trackedHref;
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      onClick={handleClick}
      className={cn(
        'inline-flex w-full cursor-pointer items-center justify-center rounded-full px-4 py-2 text-center text-xs font-semibold transition-colors',
        variant === 'primary' && 'bg-[var(--primary)] text-white hover:opacity-90',
        variant === 'outline' && 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50',
        className,
      )}
    >
      {children}
    </a>
  );
}
