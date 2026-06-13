import type { ProductListItemDto } from '@/lib/api/types';

type PriceDisplayProps = {
  price: ProductListItemDto['price'];
  strikethrough?: number | undefined;
  className?: string;
};

export function PriceDisplay({ price, strikethrough, className }: PriceDisplayProps): React.JSX.Element {
  if (price.isStale || price.amount === null) {
    return (
      <p className={className ?? 'text-sm text-neutral-500'}>
        Ver preço atualizado no marketplace
      </p>
    );
  }

  return (
    <div className={className ?? 'flex items-baseline gap-2'}>
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
  );
}
