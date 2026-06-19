'use client';

import { adminClientFetch } from '@/lib/api/admin-client';

import { GitCompare, Plus } from 'lucide-react';
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
  adminComparisonsResponseSchema,
  type AdminComparisonSummary,
} from '@ecommerce-amazon/shared/admin';

import { ComparisonFormSheet } from './ComparisonFormSheet';
import { ComparisonListView } from './ComparisonListView';

type ComparisonListManagerProps = {
  initialItems: AdminComparisonSummary[];
};

export function ComparisonListManager({
  initialItems,
}: ComparisonListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminComparisonSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminComparisonSummary | null>(null);

  const refresh = useCallback(async () => {
    const response = await adminClientFetch('/api/admin/comparisons', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar comparações');
    const payload: unknown = await response.json();
    const parsed = adminComparisonsResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error('Falha ao carregar comparações');
    setItems(parsed.data.items);
  }, []);

  function openCreate(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(item: AdminComparisonSummary): void {
    setEditing(item);
    setSheetOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      const response = await adminClientFetch(`/api/admin/comparisons/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao excluir comparação');
      adminToast.success('Comparação excluída.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir comparação');
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <GitCompare className="mr-2 inline h-4 w-4" />
            Comparações editoriais
          </h2>
          <p className="cms-panel-meta">
            <strong>Revise UGC e publique comparativos</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Intro editorial, slug legível e SEO para indexação. UGC permanece em rascunho até
              publicação.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <span className="text-sm text-[var(--admin-text-muted)]">{items.length} itens</span>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Nova comparação
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem · <strong>{items.length} comparações</strong>
        </p>
        <ComparisonListView items={items} onEdit={openEdit} onDelete={setDeleteTarget} />
      </div>

      <ComparisonFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comparação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove o comparativo e o link compartilhável. Não pode ser desfeita.
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
