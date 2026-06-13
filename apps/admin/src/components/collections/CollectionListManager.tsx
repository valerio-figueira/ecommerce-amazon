'use client';

import { Layers, Plus } from 'lucide-react';
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
  adminCollectionsResponseSchema,
  type AdminCollectionSummary,
} from '@ecommerce-amazon/shared/admin';

import { CollectionFormSheet } from './CollectionFormSheet';
import { CollectionListView } from './CollectionListView';

type CollectionListManagerProps = {
  initialItems: AdminCollectionSummary[];
};

export function CollectionListManager({
  initialItems,
}: CollectionListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCollectionSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCollectionSummary | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/admin/collections', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar coleções');
    const payload: unknown = await response.json();
    const parsed = adminCollectionsResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error('Falha ao carregar coleções');
    setItems(parsed.data.items);
  }, []);

  function openCreate(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(item: AdminCollectionSummary): void {
    setEditing(item);
    setSheetOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/admin/collections/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao excluir coleção');
      adminToast.success('Coleção excluída.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir coleção');
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Layers className="mr-2 inline h-4 w-4" />
            Coleções curadas
          </h2>
          <p className="cms-panel-meta">
            <strong>Guias temáticos</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Seleções manuais para conversão e SEO em /colecoes/[slug].
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <span className="text-sm text-[var(--admin-text-muted)]">
            <strong>{items.length}</strong> coleção{items.length === 1 ? '' : 'ões'}
          </span>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Nova coleção
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem · <strong>{items.length} itens</strong>
        </p>
        <CollectionListView
          items={items}
          onEdit={openEdit}
          onDelete={(item) => setDeleteTarget(item)}
        />
      </div>

      <CollectionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir coleção?</AlertDialogTitle>
            <AlertDialogDescription>
              A coleção &quot;{deleteTarget?.title}&quot; será removida permanentemente. Blocos CMS
              que referenciam este slug deixarão de exibir dados.
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
