import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type ProductRatingProps = {
  rating?: number | undefined;
  reviewCount?: number | undefined;
  className?: string;
};

export function ProductRating({
  rating,
  reviewCount,
  className,
}: ProductRatingProps): React.JSX.Element | null {
  if (rating === undefined) {
    return null;
  }

  const formattedRating = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);

  const formattedReviews =
    reviewCount !== undefined
      ? new Intl.NumberFormat('pt-BR').format(reviewCount)
      : undefined;

  return (
    <div className={cn('flex items-center gap-1 text-xs text-neutral-500', className)}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span>
        {formattedRating}
        {formattedReviews !== undefined && ` · ${formattedReviews} avaliações`}
      </span>
    </div>
  );
}
