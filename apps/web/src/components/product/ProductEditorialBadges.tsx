import type { ProductListItemDto } from '@/lib/api/types';
import { resolveEditorialBadge } from '@/lib/product-badges';
import { cn } from '@/lib/utils';

type ProductEditorialBadgesProps = {
  product: ProductListItemDto;
  className?: string;
};

const badgeStyles: Record<string, string> = {
  editors_pick: 'bg-amber-500 text-white',
  top_rated: 'bg-neutral-800 text-white',
  best_offer: 'bg-emerald-600 text-white',
};

export function ProductEditorialBadges({
  product,
  className,
}: ProductEditorialBadgesProps): React.JSX.Element | null {
  const badge = resolveEditorialBadge(product);
  if (!badge) {
    return null;
  }

  return (
    <span
      className={cn(
        'absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm',
        badgeStyles[badge.type],
        className,
      )}
    >
      {badge.label}
    </span>
  );
}
