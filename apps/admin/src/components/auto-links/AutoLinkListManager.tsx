'use client';

import { Link2, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
import {
  deleteAutoLinkClient,
  listAutoLinksClient,
  updateAutoLinkClient,
} from '@/lib/api/auto-links-client';
import type {
  AdminAutoLinkListResponse,
  AdminAutoLinkSummary,
} from '@ecommerce-amazon/shared/admin';

import { AutoLinkFormSheet } from './AutoLinkFormSheet';
import { AutoLinkListView } from './AutoLinkListView';

type AutoLinkListManagerProps = {
  initialData: AdminAutoLinkListResponse;
};

const DEFAULT_LIMIT = 20;

export function AutoLinkListManager({
  initialData,
}: AutoLinkListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [limit] = useState(initialData.limit || DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAutoLinkSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAutoLinkSummary | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const skipSearchDebounce = useRef(true);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const refresh = useCallback(
    async (params?: { page?: number; search?: string }) => {
      setLoading(true);
      try {
        const nextPage = params?.page ?? page;
        const nextSearch = params?.search ?? search;
        const result = await listAutoLinksClient({
          page: nextPage,
          limit,
          ...(nextSearch.length > 0 ? { search: nextSearch } : {}),
        });
        setItems(result.items);
        setTotal(result.total);
        setPage(result.page);
      } catch (error) {
        adminToast.error(error instanceof Error ? error.message : 'Falha ao carregar auto-links');
      } finally {
        setLoading(false);
      }
    },
    [adminToast, limit, page, search],
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
      void listAutoLinksClient({
        page: 1,
        limit,
        ...(nextSearch.length > 0 ? { search: nextSearch } : {}),
      })
        .then((result) => {
          setItems(result.items);
          setTotal(result.total);
          setPage(result.page);
        })
        .catch((error: unknown) => {
          adminToast.error(error instanceof Error ? error.message : 'Falha ao carregar auto-links');
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [adminToast, limit, searchInput]);

  function openCreate(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(item: AdminAutoLinkSummary): void {
    setEditing(item);
    setSheetOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await deleteAutoLinkClient(deleteTarget.id);
      adminToast.success('Regra excluída.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir regra');
    }
  }

  async function handleToggleActive(
    item: AdminAutoLinkSummary,
    isActive: boolean,
  ): Promise<void> {
    setTogglingId(item.id);
    try {
      await updateAutoLinkClient(item.id, { isActive });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, isActive } : entry)),
      );
      adminToast.success(isActive ? 'Regra ativada.' : 'Regra desativada.');
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao atualizar regra');
    } finally {
      setTogglingId(null);
    }
  }

  function goToPage(nextPage: number): void {
    if (nextPage < 1 || nextPage > totalPages) return;
    void refresh({ page: nextPage });
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Link2 className="mr-2 inline h-4 w-4" />
            Links automáticos
          </h2>
          <p className="cms-panel-meta">
            <strong>Interlinkagem SEO</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Keywords linkadas automaticamente nos artigos editoriais. O HTML do artigo não é
              alterado — a injeção ocorre na vitrine.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions flex-wrap gap-2">
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar keyword ou URL…"
            className="max-w-xs"
            aria-label="Buscar auto-links"
          />
          <span className="text-sm text-[var(--admin-text-muted)]">
            <strong>{total}</strong> regra{total === 1 ? '' : 's'}
          </span>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Nova keyword
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem · <strong>{items.length}</strong> nesta página
          {loading ? ' · atualizando…' : ''}
        </p>
        <AutoLinkListView
          items={items}
          togglingId={togglingId}
          onEdit={openEdit}
          onDelete={(item) => setDeleteTarget(item)}
          onToggleActive={(item, isActive) => void handleToggleActive(item, isActive)}
          onCreate={openCreate}
        />

        {totalPages > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-4">
            <p className="text-xs text-[var(--admin-text-muted)]">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => goToPage(page - 1)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => goToPage(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <AutoLinkFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir auto-link?</AlertDialogTitle>
            <AlertDialogDescription>
              A regra &quot;{deleteTarget?.keyword}&quot; será removida permanentemente. Artigos
              publicados deixarão de receber este link na próxima renderização.
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
