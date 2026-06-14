'use client';

import { FolderOpen, Plus } from 'lucide-react';
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
  articleCategoriesResponseSchema,
  type ArticleCategorySummary,
} from '@ecommerce-amazon/shared/admin';

import { ArticleCategoryFormSheet } from './ArticleCategoryFormSheet';
import { ArticleCategoryListView } from './ArticleCategoryListView';

type ArticleCategoryListManagerProps = {
  initialItems: ArticleCategorySummary[];
};

export function ArticleCategoryListManager({
  initialItems,
}: ArticleCategoryListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleCategorySummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleCategorySummary | null>(null);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/admin/article-categories', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar categorias');
    const payload: unknown = await response.json();
    const parsed = articleCategoriesResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error('Falha ao carregar categorias');
    setItems(parsed.data.items);
  }, []);

  function openCreate(): void {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(item: ArticleCategorySummary): void {
    setEditing(item);
    setSheetOpen(true);
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/admin/article-categories/${deleteTarget.id}`, {
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
            : 'Falha ao excluir categoria';
        throw new Error(message);
      }
      adminToast.success('Categoria excluída.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir categoria');
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <FolderOpen className="mr-2 inline h-4 w-4" />
            Categorias de artigos
          </h2>
          <p className="cms-panel-meta">
            <strong>Taxonomia editorial</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Organize guias, reviews e comparativos. Usadas no badge e nos artigos relacionados.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <Button asChild variant="outline">
            <Link href="/artigos">Voltar aos artigos</Link>
          </Button>
          <span className="text-sm text-[var(--admin-text-muted)]">
            <strong>{items.length}</strong> categoria{items.length === 1 ? '' : 's'}
          </span>
          <Button type="button" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Nova categoria
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem · <strong>{items.length} itens</strong>
        </p>
        <ArticleCategoryListView
          items={items}
          onEdit={openEdit}
          onDelete={(item) => setDeleteTarget(item)}
        />
      </div>

      <ArticleCategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
        onSaved={refresh}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              A categoria &quot;{deleteTarget?.name}&quot; será removida permanentemente. Só é
              possível excluir categorias sem artigos vinculados.
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
