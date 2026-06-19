'use client';

import { Package, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminPagination } from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminToast } from '@/components/ui/admin-toast';
import { listAdminProductsClient } from '@/lib/api/admin-products-client';
import type { AdminProductListResponse } from '@ecommerce-amazon/shared/admin';

import { ProductListCard } from './ProductListCard';

type ProductListManagerProps = {
  initialData: AdminProductListResponse;
};

const DEFAULT_PAGE_SIZE = 12;

export function ProductListManager({
  initialData,
}: ProductListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [pageSize] = useState(initialData.pageSize || DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const skipSearchDebounce = useRef(true);

  const refresh = useCallback(
    async (params?: { page?: number; search?: string }) => {
      setLoading(true);
      try {
        const nextPage = params?.page ?? page;
        const nextSearch = params?.search ?? search;
        const result = await listAdminProductsClient({
          page: nextPage,
          pageSize,
          ...(nextSearch.length > 0 ? { search: nextSearch } : {}),
        });
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (error) {
        adminToast.error(error instanceof Error ? error.message : 'Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    },
    [adminToast, page, pageSize, search],
  );

  useEffect(() => {
    if (skipSearchDebounce.current) {
      skipSearchDebounce.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim();
      setSearch(nextSearch);
      setLoading(true);
      void listAdminProductsClient({
        page: 1,
        pageSize,
        ...(nextSearch.length > 0 ? { search: nextSearch } : {}),
      })
        .then((result) => {
          setItems(result.items);
          setTotal(result.total);
          setPage(result.page);
        })
        .catch((error: unknown) => {
          adminToast.error(error instanceof Error ? error.message : 'Erro ao carregar produtos');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [adminToast, pageSize, searchInput]);

  function goToPage(nextPage: number): void {
    void refresh({ page: nextPage });
  }

  const hasSearch = search.length > 0;
  const emptyCatalog = !hasSearch && total === 0 && items.length === 0;
  const emptySearch = hasSearch && total === 0;

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">Gestão de catálogo</h2>
          <p className="cms-panel-meta">
            <strong>Catálogo manual e híbrido</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Cadastre produtos via link de afiliado enquanto as APIs oficiais não estão
              disponíveis. O parser detecta marketplace e código do produto automaticamente.
            </span>
          </p>
        </div>

        <div className="cms-panel-actions flex-wrap gap-2">
          <div className="relative mr-auto min-w-[220px] max-w-sm flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              aria-hidden
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por título ou slug…"
              className="pl-9"
              aria-label="Buscar produtos"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
            <Package className="h-4 w-4 text-[var(--admin-primary)]" aria-hidden />
            <span>
              <strong className="text-[var(--admin-navy)]">{total}</strong> produto
              {total === 1 ? '' : 's'}
              {hasSearch ? ' encontrado(s)' : ' no catálogo'}
            </span>
          </div>

          <Button asChild variant="primary" size="sm">
            <Link href="/produtos/novo">
              <Plus className="h-4 w-4" />
              Novo produto
            </Link>
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          {hasSearch ? (
            <>
              Resultados para &quot;{search}&quot; · <strong>{total}</strong>{' '}
              {total === 1 ? 'item' : 'itens'}
            </>
          ) : (
            <>
              Produtos cadastrados · <strong>{total}</strong>{' '}
              {total === 1 ? 'item' : 'itens'}
            </>
          )}
          {loading ? ' · atualizando…' : ''}
        </p>

        {emptyCatalog ? (
          <div className="cms-empty-state">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-primary)]">
              <Package className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
              Nenhum produto cadastrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
              Cole um link de afiliado da Amazon, Shopee ou Mercado Livre para começar.
            </p>
            <Button asChild variant="primary" size="sm" className="mt-4">
              <Link href="/produtos/novo">
                <Plus className="h-4 w-4" />
                Cadastrar primeiro produto
              </Link>
            </Button>
          </div>
        ) : emptySearch ? (
          <div className="cms-empty-state">
            <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
              Nenhum produto encontrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
              Tente outro termo de busca ou cadastre um novo produto.
            </p>
          </div>
        ) : (
          <>
            <div
              className="admin-product-grid"
              aria-busy={loading}
              aria-live="polite"
            >
              {items.map((product) => (
                <ProductListCard key={product.id} product={product} />
              ))}
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              loading={loading}
              itemLabel={total === 1 ? 'produto' : 'produtos'}
              onPageChange={goToPage}
              className="mt-5"
            />
          </>
        )}
      </div>
    </section>
  );
}
