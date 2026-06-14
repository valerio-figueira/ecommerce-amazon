import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type ProductRatingProps = {
  rating?: number | undefined;
  reviewCount?: number | undefined;
  className?: string;
  compact?: boolean;
};

export function ProductRating({
  rating,
  reviewCount,
  className,
  compact = false,
}: ProductRatingProps): React.JSX.Element | null {
  const rowHeight = compact ? 'min-h-4' : 'min-h-[1.125rem]';

  if (rating === undefined) {
    return null;
  }

  const formattedRating = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);

  const formattedReviews =
    reviewCount !== undefined
      ? new Intl.NumberFormat('pt-BR', compact ? { notation: 'compact' } : undefined).format(
          reviewCount,
        )
      : undefined;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 text-neutral-500',
        rowHeight,
        compact ? 'text-[10px]' : 'text-xs',
        className,
      )}
    >
      <Star
        className={cn('fill-amber-400 text-amber-400', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')}
        aria-hidden
      />
      <span className="truncate">
        {formattedRating}
        {formattedReviews !== undefined &&
          (compact ? ` · ${formattedReviews}` : ` · ${formattedReviews} avaliações`)}
      </span>
    </div>
  );
}
