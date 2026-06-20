'use client';

import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';
import { cn } from '@/lib/utils';

type ProductMultiPickerProps = {
  products: ProductPickerOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  maxItems?: number;
};

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  return marketplace;
}

export function ProductMultiPicker({
  products,
  value,
  onChange,
  maxItems = 3,
}: ProductMultiPickerProps): React.JSX.Element {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query),
    );
  }, [filter, products]);

  const toggleProduct = (id: string): void => {
    if (value.includes(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }
    if (value.length >= maxItems) return;
    onChange([...value, id]);
  };

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Buscar produtos…"
        className="text-sm"
      />
      <p className="text-xs text-[var(--admin-text-muted)]">
        Selecione até {maxItems} produtos ({value.length}/{maxItems})
      </p>
      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--admin-gray)] p-2">
        {filtered.length === 0 ? (
          <li className="px-2 py-3 text-center text-xs text-[var(--admin-text-muted)]">
            Nenhum produto encontrado
          </li>
        ) : (
          filtered.map((product) => {
            const selected = value.includes(product.id);
            const disabled = !selected && value.length >= maxItems;
            return (
              <li key={product.id}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleProduct(product.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                    selected
                      ? 'bg-[var(--admin-primary)]/10 font-medium text-[var(--admin-navy-deep)]'
                      : 'hover:bg-neutral-50',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]',
                      selected
                        ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white'
                        : 'border-neutral-300',
                    )}
                    aria-hidden
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {product.title} · {marketplaceLabel(product.marketplace)}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
