'use client';

import { cn } from '@/lib/utils';
import type { SearchResultType } from '@/lib/api/search';

export type { SearchResultType };

type SearchTypeSwitchProps = {
  activeType: SearchResultType;
  productCount: number | null;
  articleCount: number | null;
  onChange: (type: SearchResultType) => void;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
};

function formatCount(count: number | null): string {
  if (count === null) return '…';
  if (count > 999) return '999+';
  return String(count);
}

function countBadgeClassName(active: boolean, size: 'sm' | 'md'): string {
  return cn(
    'rounded-full px-1.5 tabular-nums font-semibold',
    size === 'sm' ? 'py-0 text-[10px]' : 'py-0.5 text-xs',
    active ? 'bg-[var(--primary)]/15 text-[var(--primary)]' : 'bg-neutral-200/80 text-neutral-600',
  );
}

export function SearchTypeSwitch({
  activeType,
  productCount,
  articleCount,
  onChange,
  className,
  size = 'md',
  disabled = false,
}: SearchTypeSwitchProps): React.JSX.Element {
  const buttonClassName = (active: boolean): string =>
    cn(
      'flex flex-1 items-center justify-center gap-1.5 rounded-full font-medium transition-all',
      size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
      active
        ? 'bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/80'
        : 'text-neutral-600 hover:text-neutral-900',
      disabled && 'pointer-events-none opacity-60',
    );

  return (
    <div
      className={cn(
        'inline-flex w-full rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200/60',
        className,
      )}
      role="tablist"
      aria-label="Tipo de resultado da busca"
    >
      <button
        type="button"
        role="tab"
        id="search-tab-products"
        aria-selected={activeType === 'products'}
        aria-controls="search-panel-products"
        className={buttonClassName(activeType === 'products')}
        onClick={() => onChange('products')}
        disabled={disabled}
      >
        Produtos
        <span className={countBadgeClassName(activeType === 'products', size)}>
          {formatCount(productCount)}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        id="search-tab-articles"
        aria-selected={activeType === 'articles'}
        aria-controls="search-panel-articles"
        className={buttonClassName(activeType === 'articles')}
        onClick={() => onChange('articles')}
        disabled={disabled}
      >
        Artigos
        <span className={countBadgeClassName(activeType === 'articles', size)}>
          {formatCount(articleCount)}
        </span>
      </button>
    </div>
  );
}
