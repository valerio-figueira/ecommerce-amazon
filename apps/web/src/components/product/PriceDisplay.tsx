import { RefreshCw } from 'lucide-react';

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
}: PriceDisplayProps): React.JSX.Element {
  const minHeight = compact ? undefined : 'min-h-[48px]';

  if (price.isStale || price.amount === null) {
    return (
      <div className={cn('flex flex-col justify-center', minHeight, className)}>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md bg-amber-50 font-medium text-amber-700',
            compact ? 'px-1.5 py-1 text-[10px]' : 'gap-1.5 px-2 py-1.5 text-xs',
          )}
        >
          <RefreshCw className={cn('shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
          Consultar preço atualizado
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', minHeight, compact ? 'gap-0' : 'justify-center gap-0.5', className)}>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('font-bold', compact ? 'text-sm' : 'text-lg')}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: price.currency }).format(
            price.amount,
          )}
        </span>
        {strikethrough !== undefined && (
          <span className={cn('text-neutral-400 line-through', compact ? 'text-[10px]' : 'text-sm')}>
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
