'use client';

import { adminClientFetch } from '@/lib/api/admin-client';

import { GitBranch, Plus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

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
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  contentClustersAdminResponseSchema,
  type ContentClusterAdminSummary,
} from '@ecommerce-amazon/shared/admin';

import { ContentClusterFormSheet } from './ContentClusterFormSheet';
import { ContentClusterListView } from './ContentClusterListView';

type ContentClusterListManagerProps = {
  initialItems: ContentClusterAdminSummary[];
};

export function ContentClusterListManager({
  initialItems,
}: ContentClusterListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ContentClusterAdminSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentClusterAdminSummary | null>(null);

  const refresh = useCallback(async () => {
    const response = await adminClientFetch('/api/admin/content-clusters', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar clusters');
    const payload: unknown = await response.json();
    const parsed = contentClustersAdminResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error('Falha ao carregar clusters');
    setItems(parsed.data.items);
  }, []);

  function openCreate(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(item: ContentClusterAdminSummary): void {
    setEditing(item);
    setSheetOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      const response = await adminClientFetch(`/api/admin/content-clusters/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : 'Falha ao excluir cluster';
        throw new Error(message);
      }
      adminToast.success('Cluster excluído.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir cluster');
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <GitBranch className="mr-2 inline h-4 w-4" />
            Clusters de conteúdo
          </h2>
          <p className="cms-panel-meta">
            <strong>Hub &amp; Spoke editorial</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Agrupe artigos satélite em torno de um guia pilar. A vitrine exibe índice SEO e
              carrossel de recirculação.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <Button asChild variant="outline">
            <Link href="/artigos">Voltar aos artigos</Link>
          </Button>
          <span className="text-sm text-[var(--admin-text-muted)]">
            <strong>{items.length}</strong> cluster{items.length === 1 ? '' : 's'}
          </span>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Novo cluster
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem · <strong>{items.length} itens</strong>
        </p>
        <ContentClusterListView items={items} onEdit={openEdit} onDelete={setDeleteTarget} />
      </div>

      <ContentClusterFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cluster?</AlertDialogTitle>
            <AlertDialogDescription>
              O cluster &quot;{deleteTarget?.name}&quot; será removido. Os artigos vinculados
              perdem a associação, mas não são excluídos.
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
