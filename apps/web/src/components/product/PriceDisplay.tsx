import type { ProductListItemDto } from '@/lib/api/types';
import { formatHoursSinceUpdated } from '@/lib/product-badges';
import { cn } from '@/lib/utils';

type PriceDisplayProps = {
  price: ProductListItemDto['price'];
  strikethrough?: number | undefined;
  className?: string;
  compact?: boolean;
};

export function PriceDisplay({
  price,
  strikethrough,
  className,
  compact = false,
}: PriceDisplayProps): React.JSX.Element | null {
  if (price.isStale || price.amount === null) {
    return null;
  }

  const minHeight = compact ? 'min-h-[1.25rem]' : 'min-h-[48px]';

  return (
    <div
      className={cn(
        'flex flex-col',
        minHeight,
        compact ? 'gap-0' : 'justify-center gap-0.5',
        className,
      )}
    >
      <div className="flex items-baseline gap-1.5">
        <span className={cn('font-bold tabular-nums', compact ? 'text-sm' : 'text-lg')}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: price.currency }).format(
            price.amount,
          )}
        </span>
        {strikethrough !== undefined && (
          <span
            className={cn(
              'tabular-nums text-neutral-400 line-through',
              compact ? 'text-[10px]' : 'text-sm',
            )}
          >
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: price.currency }).format(
              strikethrough,
            )}
          </span>
        )}
      </div>
      {!compact && (
        <p className="text-[10px] font-medium text-emerald-600">
          {formatHoursSinceUpdated(price.updatedAt)}
        </p>
      )}
    </div>
  );
}
