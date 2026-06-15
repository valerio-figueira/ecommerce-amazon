'use client';

import { usePathname } from 'next/navigation';

import type { ClickPlacementValue } from '@ecommerce-amazon/shared/analytics';

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
  const pagePath = pagePathProp ?? pathname;

  const href = buildGoUrl(slug, {
    ...(blockId !== undefined ? { blockId } : {}),
    ...(articleId !== undefined ? { articleId } : {}),
    ...(collectionId !== undefined ? { collectionId } : {}),
    ...(sessionId !== undefined ? { sessionId } : {}),
    origin,
    ...(placement !== undefined ? { placement } : {}),
    pagePath,
    ...(referrerPath !== undefined ? { referrerPath } : {}),
    ...(utmDefaults !== undefined ? { utmDefaults } : {}),
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
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
