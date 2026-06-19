'use client';

import { Newspaper, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminPagination } from '@/components/admin/AdminPagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminToast } from '@/components/ui/admin-toast';
import { deleteAdminArticleClient, listAdminArticlesClient } from '@/lib/api/articles-client';
import type { AdminArticlesListResponse, AdminArticleSummary } from '@ecommerce-amazon/shared/admin';

import { ArticleListCard } from './ArticleListCard';

type ArticleListManagerProps = {
  initialData: AdminArticlesListResponse;
};

const DEFAULT_PAGE_SIZE = 12;

export function ArticleListManager({
  initialData,
}: ArticleListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [pageSize] = useState(initialData.pageSize || DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminArticleSummary | null>(null);
  const skipSearchDebounce = useRef(true);

  const refresh = useCallback(
    async (params?: { page?: number; search?: string }) => {
      setLoading(true);
      try {
        const nextPage = params?.page ?? page;
        const nextSearch = params?.search ?? search;
        const result = await listAdminArticlesClient({
          page: nextPage,
          pageSize,
          ...(nextSearch.length > 0 ? { search: nextSearch } : {}),
        });
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (error) {
        adminToast.error(error instanceof Error ? error.message : 'Falha ao carregar artigos');
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
      void listAdminArticlesClient({
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
          adminToast.error(error instanceof Error ? error.message : 'Falha ao carregar artigos');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [adminToast, pageSize, searchInput]);

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await deleteAdminArticleClient(deleteTarget.id);
      adminToast.success('Artigo excluído.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir artigo');
    }
  }

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
          <h2 className="cms-panel-title">
            <Newspaper className="mr-2 inline h-4 w-4" />
            Artigos editoriais
          </h2>
          <p className="cms-panel-meta">
            <strong>Hub de conteúdo</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Guias, reviews e comparativos com embeds dinâmicos de produtos.
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
              placeholder="Buscar por título, resumo ou slug…"
              className="pl-9"
              aria-label="Buscar artigos"
            />
          </div>

          <span className="text-xs text-[var(--admin-text-muted)]">
            <strong className="text-[var(--admin-navy)]">{total}</strong> artigo
            {total === 1 ? '' : 's'}
            {hasSearch ? ' encontrado(s)' : ''}
          </span>

          <Button asChild variant="outline" size="sm">
            <Link href="/artigos/categorias">Categorias</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/content-clusters">Clusters</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/auto-links">Auto-Links</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/artigos/novo">
              <Plus className="h-4 w-4" />
              Novo artigo
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
              Listagem editorial · <strong>{total}</strong>{' '}
              {total === 1 ? 'item' : 'itens'}
            </>
          )}
          {loading ? ' · atualizando…' : ''}
        </p>

        {emptyCatalog ? (
          <div className="cms-empty-state">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-primary)]">
              <Newspaper className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
              Nenhum artigo cadastrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
              Crie guias, reviews e comparativos editoriais com embeds de produtos.
            </p>
            <Button asChild variant="primary" size="sm" className="mt-4">
              <Link href="/artigos/novo">
                <Plus className="h-4 w-4" />
                Criar primeiro artigo
              </Link>
            </Button>
          </div>
        ) : emptySearch ? (
          <div className="cms-empty-state">
            <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
              Nenhum artigo encontrado
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
              Tente outro termo de busca ou crie um novo artigo.
            </p>
          </div>
        ) : (
          <>
            <div className="admin-article-grid" aria-busy={loading} aria-live="polite">
              {items.map((article) => (
                <ArticleListCard
                  key={article.id}
                  article={article}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              total={total}
              loading={loading}
              itemLabel={total === 1 ? 'artigo' : 'artigos'}
              onPageChange={goToPage}
              className="mt-5"
            />
          </>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente &quot;{deleteTarget?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
