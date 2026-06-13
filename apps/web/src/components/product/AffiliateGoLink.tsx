'use client';

import { recordClick } from '@/lib/api/events';
import { buildGoUrl } from '@/lib/go-url';
import { cn } from '@/lib/utils';

type AffiliateGoLinkProps = {
  productId: string;
  slug: string;
  sessionId?: string | undefined;
  blockId?: string | undefined;
  origin?: 'listagem' | 'detalhe' | 'embed' | 'comparador' | 'cupons';
  className?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
};

export function AffiliateGoLink({
  productId,
  slug,
  sessionId,
  blockId,
  origin = 'listagem',
  className,
  children,
  variant = 'outline',
}: AffiliateGoLinkProps): React.JSX.Element {
  const href = buildGoUrl(slug, {
    ...(blockId !== undefined ? { blockId } : {}),
    ...(sessionId !== undefined ? { sessionId } : {}),
  });

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
    event.stopPropagation();
    void recordClick(productId, origin, sessionId);
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
