'use client';

import { GitCompare } from 'lucide-react';

import { useComparison } from '@/components/comparison/ComparisonProvider';
import type { ComparisonToggleInput } from '@/components/comparison/comparison-storage';
import { cn } from '@/lib/utils';

type ProductCompareToggleProps = {
  product: ComparisonToggleInput;
  className?: string;
};

export function ProductCompareToggle({
  product,
  className,
}: ProductCompareToggleProps): React.JSX.Element {
  const { isHydrated, isSelected, toggleProduct, canAddProduct } = useComparison();
  const selected = isHydrated && isSelected(product.productId);
  const disabled = isHydrated && !selected && !canAddProduct(product);

  return (
    <button
      type="button"
      aria-label={selected ? 'Remover da comparação' : 'Adicionar à comparação'}
      aria-pressed={selected}
      disabled={!isHydrated || disabled}
      className={cn(
        'rounded-full bg-white/90 p-1.5 shadow-sm transition-colors',
        selected && 'ring-2 ring-orange-500',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleProduct(product);
      }}
    >
      <GitCompare
        className={cn('h-3.5 w-3.5', selected && 'text-orange-600')}
        aria-hidden
      />
    </button>
  );
}
