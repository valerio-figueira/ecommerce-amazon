'use client';

import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';

type ProductMultiSelectProps = {
  products: ProductPickerOption[];
  value: string[];
  onChange: (productIds: string[]) => void;
};

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

export function ProductMultiSelect({
  products,
  value,
  onChange,
}: ProductMultiSelectProps): React.JSX.Element {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query),
    );
  }, [filter, products]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  function toggle(productId: string): void {
    if (value.includes(productId)) {
      onChange(value.filter((id) => id !== productId));
      return;
    }
    onChange([...value, productId]);
  }

  function moveUp(index: number): void {
    if (index <= 0) return;
    const next = [...value];
    const current = next[index];
    const previous = next[index - 1];
    if (!current || !previous) return;
    next[index - 1] = current;
    next[index] = previous;
    onChange(next);
  }

  function moveDown(index: number): void {
    if (index >= value.length - 1) return;
    const next = [...value];
    const current = next[index];
    const following = next[index + 1];
    if (!current || !following) return;
    next[index + 1] = current;
    next[index] = following;
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Buscar produto por nome ou slug…"
        className="text-sm"
      />

      <div className="cms-category-checklist max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[var(--admin-text-muted)]">
            Nenhum produto encontrado.
          </p>
        ) : (
          filtered.map((product) => {
            const checked = value.includes(product.id);
            const order = value.indexOf(product.id);
            return (
              <label
                key={product.id}
                className={cn('cms-category-check-item', checked && 'is-checked')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(product.id)}
                  className="h-4 w-4 accent-[var(--admin-primary)]"
                />
                <span className="flex-1 text-sm">
                  {product.title} · {marketplaceLabel(product.marketplace)}
                </span>
                {checked && <span className="cms-category-order-badge">{order + 1}</span>}
              </label>
            );
          })
        )}
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">
            Ordem no guia
          </p>
          {value.map((productId, index) => {
            const product = productById.get(productId);
            return (
              <div key={productId} className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--admin-navy)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="flex-1 truncate">{product?.title ?? productId}</span>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs text-[var(--admin-text-muted)] hover:bg-[var(--admin-gray)]"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs text-[var(--admin-text-muted)] hover:bg-[var(--admin-gray)]"
                  onClick={() => moveDown(index)}
                  disabled={index === value.length - 1}
                  aria-label="Mover para baixo"
                >
                  ↓
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
