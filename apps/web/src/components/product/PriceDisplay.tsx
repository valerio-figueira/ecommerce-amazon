import { RefreshCw } from 'lucide-react';

import type { ProductListItemDto } from '@/lib/api/types';
import { formatHoursSinceUpdated } from '@/lib/product-badges';
import { cn } from '@/lib/utils';

type PriceDisplayProps = {
  price: ProductListItemDto['price'];
  strikethrough?: number | undefined;
  className?: string;
};

export function PriceDisplay({ price, strikethrough, className }: PriceDisplayProps): React.JSX.Element {
  if (price.isStale || price.amount === null) {
    return (
      <div className={cn('flex min-h-[48px] flex-col justify-center', className)}>
        <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Consultar preço atualizado
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex min-h-[48px] flex-col justify-center gap-0.5', className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-bold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: price.currency }).format(
            price.amount,
          )}
        </span>
        {strikethrough !== undefined && (
          <span className="text-sm text-neutral-400 line-through">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: price.currency }).format(
              strikethrough,
            )}
          </span>
        )}
      </div>
      <p className="text-[10px] font-medium text-emerald-600">
        {formatHoursSinceUpdated(price.updatedAt)}
      </p>
    </div>
  );
}
