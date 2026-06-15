'use client';

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
  origin?: AffiliateClickOrigin;
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
  origin = 'listagem',
  utmDefaults,
  className,
  children,
  variant = 'outline',
}: AffiliateGoLinkProps): React.JSX.Element {
  const href = buildGoUrl(slug, {
    ...(blockId !== undefined ? { blockId } : {}),
    ...(articleId !== undefined ? { articleId } : {}),
    ...(sessionId !== undefined ? { sessionId } : {}),
    origin,
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
