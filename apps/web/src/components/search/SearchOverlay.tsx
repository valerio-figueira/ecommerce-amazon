'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PriceDisplay } from '@/components/product/PriceDisplay';
import { SearchTypeSwitch, type SearchResultType } from '@/components/search/SearchTypeSwitch';
import { useSearch } from '@/components/search/SearchProvider';
import { RemoteImage } from '@/components/ui/RemoteImage';
import {
  SEARCH_MIN_LENGTH,
  searchArticlesPreview,
  searchProductsPreview,
  searchTypeToParam,
} from '@/lib/api/search';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 300;

function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function SearchOverlay(): React.JSX.Element | null {
  const router = useRouter();
  const { isOpen, setOpen, initialQuery } = useSearch();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeType, setActiveType] = useState<SearchResultType>('products');
  const inputRef = useRef<HTMLInputElement>(null);
  const skipDebounce = useRef(true);

  useEffect(() => {
    if (!isOpen) return;

    setQuery(initialQuery);
    setDebouncedQuery(initialQuery);
    setActiveType('products');
    skipDebounce.current = true;

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setOpen]);

  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  const canSearch = debouncedQuery.length >= SEARCH_MIN_LENGTH;

  const productsQuery = useQuery({
    queryKey: ['search-preview', 'products', debouncedQuery],
    queryFn: () => searchProductsPreview(debouncedQuery),
    enabled: isOpen && canSearch,
    staleTime: 30_000,
  });

  const articlesQuery = useQuery({
    queryKey: ['search-preview', 'articles', debouncedQuery],
    queryFn: () => searchArticlesPreview(debouncedQuery),
    enabled: isOpen && canSearch,
    staleTime: 30_000,
  });

  const navigateToResults = useCallback((): void => {
    const trimmed = query.trim();
    if (trimmed.length < SEARCH_MIN_LENGTH) return;
    setOpen(false);

    const params = new URLSearchParams({ q: trimmed });
    if (activeType === 'articles') {
      params.set('tipo', searchTypeToParam(activeType));
    }
    router.push(`/busca?${params.toString()}`);
  }, [activeType, query, router, setOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    navigateToResults();
  };

  if (!isOpen) return null;

  const isLoading = canSearch && (productsQuery.isFetching || articlesQuery.isFetching);
  const hasError = productsQuery.isError || articlesQuery.isError;
  const productItems = productsQuery.data?.items ?? [];
  const articleItems = articlesQuery.data?.items ?? [];
  const productTotal = productsQuery.data?.total ?? null;
  const articleTotal = articlesQuery.data?.total ?? null;
  const activeItems = activeType === 'products' ? productItems : articleItems;
  const activeTotal = activeType === 'products' ? productTotal : articleTotal;
  const hasActiveResults = (activeTotal ?? 0) > 0;
  const hasAnyResults = (productTotal ?? 0) > 0 || (articleTotal ?? 0) > 0;
  const shortcutLabel = isMacPlatform() ? '⌘K' : 'Ctrl+K';
  const switchDisabled = canSearch && isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar busca"
        onClick={() => setOpen(false)}
      />

      <div
        className="relative flex max-h-[min(80vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar produtos e artigos"
      >
        <form className="border-b border-neutral-200 px-4 py-3" onSubmit={handleSubmit}>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produtos e artigos…"
              aria-label="Buscar produtos e artigos"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-11 text-base outline-none ring-[var(--primary)] focus:border-[var(--primary)] focus:ring-2"
            />
            {query ? (
              <button
                type="button"
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                  inputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>

        {canSearch ? (
          <div className="border-b border-neutral-200 px-4 py-3">
            <SearchTypeSwitch
              activeType={activeType}
              productCount={productTotal}
              articleCount={articleTotal}
              onChange={setActiveType}
              size="sm"
              disabled={switchDisabled}
            />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {!canSearch ? (
            <p className="text-center text-sm text-neutral-500">
              Digite pelo menos {SEARCH_MIN_LENGTH} caracteres para buscar. Atalho: {shortcutLabel}
            </p>
          ) : null}

          {canSearch && isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Buscando…
            </div>
          ) : null}

          {canSearch && !isLoading && hasError ? (
            <p className="py-8 text-center text-sm text-red-600">
              Não foi possível carregar os resultados. Tente novamente.
            </p>
          ) : null}

          {canSearch && !isLoading && !hasError && !hasAnyResults ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;.
            </p>
          ) : null}

          {canSearch && !isLoading && !hasError && hasAnyResults && !hasActiveResults ? (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-500">
                Nenhum {activeType === 'products' ? 'produto' : 'artigo'} para &ldquo;
                {debouncedQuery}&rdquo;.
              </p>
              {activeType === 'products' && (articleTotal ?? 0) > 0 ? (
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
                  onClick={() => setActiveType('articles')}
                >
                  Ver {articleTotal} artigo{articleTotal === 1 ? '' : 's'}
                </button>
              ) : null}
              {activeType === 'articles' && (productTotal ?? 0) > 0 ? (
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline"
                  onClick={() => setActiveType('products')}
                >
                  Ver {productTotal} produto{productTotal === 1 ? '' : 's'}
                </button>
              ) : null}
            </div>
          ) : null}

          {canSearch && !isLoading && !hasError && hasActiveResults ? (
            <div
              role="tabpanel"
              id={activeType === 'products' ? 'search-panel-products' : 'search-panel-articles'}
              aria-labelledby={
                activeType === 'products' ? 'search-tab-products' : 'search-tab-articles'
              }
            >
              {activeType === 'products' ? (
                <ul className="space-y-2">
                  {productItems.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-neutral-50"
                        onClick={() => setOpen(false)}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {product.imageUrl ? (
                            <RemoteImage
                              src={product.imageUrl}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="h-full w-full object-contain"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                          <PriceDisplay price={product.price} compact />
                          {product.price.isStale || product.price.amount === null ? (
                            <p className="text-xs text-neutral-500">Ver preço na loja</p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  {articleItems.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/artigos/${article.slug}`}
                        className="block rounded-xl p-2 hover:bg-neutral-50"
                        onClick={() => setOpen(false)}
                      >
                        <p className="line-clamp-2 text-sm font-medium">{article.title}</p>
                        {article.excerpt ? (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {article.excerpt}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {(activeTotal ?? 0) > activeItems.length ? (
                <p className="mt-3 text-center text-xs text-neutral-500">
                  Mostrando {activeItems.length} de {activeTotal}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {canSearch && !isLoading && !hasError && hasActiveResults ? (
          <div className="border-t border-neutral-200 px-4 py-3">
            <button
              type="button"
              className={cn(
                'w-full rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white',
                'hover:opacity-90',
              )}
              onClick={navigateToResults}
            >
              Ver todos os {activeType === 'products' ? 'produtos' : 'artigos'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
