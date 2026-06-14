'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import type { ArticleCategoryPublic } from '@ecommerce-amazon/shared/admin';

import { cn } from '@/lib/utils';

type ArticleListingToolbarProps = {
  categories: ArticleCategoryPublic[];
  total: number;
  activeCategory: string | null;
  activeSearch: string;
};

function pillClassName(active: boolean): string {
  return cn(
    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-[var(--primary)] text-white'
      : 'border border-neutral-300 bg-white hover:bg-neutral-50',
  );
}

export function ArticleListingToolbar({
  categories,
  total,
  activeCategory,
  activeSearch,
}: ArticleListingToolbarProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(activeSearch);
  const skipSearchDebounce = useRef(true);

  useEffect(() => {
    setSearchValue(activeSearch);
    skipSearchDebounce.current = true;
  }, [activeSearch]);

  const applyParams = useCallback(
    (next: { categoria?: string | null; q?: string | null; page?: number | null }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.categoria === null) {
        params.delete('categoria');
      } else if (next.categoria !== undefined) {
        params.set('categoria', next.categoria);
      }

      if (next.q === null || next.q === '') {
        params.delete('q');
      } else if (next.q !== undefined) {
        params.set('q', next.q);
      }

      if (next.page === null || next.page === 1) {
        params.delete('page');
      } else if (next.page !== undefined && next.page > 1) {
        params.set('page', String(next.page));
      }

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (skipSearchDebounce.current) {
      skipSearchDebounce.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      if (searchValue === activeSearch) return;
      applyParams({ q: searchValue || null, page: null });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchValue, activeSearch, applyParams]);

  const hasFilters = Boolean(activeCategory || activeSearch);

  return (
    <div
      className={cn(
        'space-y-5 rounded-[var(--radius)] border border-neutral-200 bg-white p-4 md:p-5',
        isPending && 'opacity-70',
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar artigos por título ou resumo..."
            aria-label="Buscar artigos"
            className="h-11 w-full rounded-full border border-neutral-300 bg-neutral-50 pl-10 pr-10 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
          />
          {searchValue ? (
            <button
              type="button"
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
              onClick={() => {
                setSearchValue('');
                applyParams({ q: null, page: null });
              }}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <p className="shrink-0 text-sm text-neutral-500">
          {total === 0
            ? 'Nenhum artigo encontrado'
            : `${total} artigo${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`}
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Categorias
          </span>
          <button
            type="button"
            className={pillClassName(!activeCategory)}
            onClick={() => applyParams({ categoria: null, page: null })}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              className={pillClassName(activeCategory === category.slug)}
              onClick={() =>
                applyParams({
                  categoria: activeCategory === category.slug ? null : category.slug,
                  page: null,
                })
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}

      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span>Filtros ativos:</span>
          {activeCategory ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 hover:bg-neutral-100"
              onClick={() => applyParams({ categoria: null, page: null })}
            >
              {categories.find((item) => item.slug === activeCategory)?.name ?? activeCategory}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {activeSearch ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 hover:bg-neutral-100"
              onClick={() => {
                setSearchValue('');
                applyParams({ q: null, page: null });
              }}
            >
              &quot;{activeSearch}&quot;
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
