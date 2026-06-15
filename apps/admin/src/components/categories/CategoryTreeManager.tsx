'use client';

import { FolderTree, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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
import { collectCategoryNodes } from '@/lib/api/categories-utils';
import { adminCategoriesResponseSchema, type AdminCategoryTreeNode } from '@ecommerce-amazon/shared/admin';

import { CategoryFormSheet } from './CategoryFormSheet';
import { CategoryTreeView } from './CategoryTreeView';

type CategoryTreeManagerProps = {
  initialItems: AdminCategoryTreeNode[];
};

export function CategoryTreeManager({ initialItems }: CategoryTreeManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryTreeNode | null>(null);
  const [parentForCreate, setParentForCreate] = useState<AdminCategoryTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryTreeNode | null>(null);

  const totalCount = useMemo(() => collectCategoryNodes(items).length, [items]);
  const nodeById = useMemo(() => {
    const map = new Map<string, AdminCategoryTreeNode>();
    collectCategoryNodes(items).forEach((node) => map.set(node.id, node));
    return map;
  }, [items]);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/admin/categories', { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao carregar categorias');
    const payload: unknown = await response.json();
    if (typeof payload !== 'object' || payload === null || !('items' in payload)) {
      throw new Error('Falha ao carregar categorias');
    }
    const parsed = adminCategoriesResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error('Falha ao carregar categorias');
    }
    setItems(parsed.data.items);
  }, []);

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const node = nodeById.get(id);
    if (!node) return;

    const siblings = collectCategoryNodes(items)
      .filter((item) => (item.parentId ?? null) === (node.parentId ?? null))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = siblings.findIndex((item) => item.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;

    const reordered = [...siblings];
    const current = reordered[index];
    const swap = reordered[swapIndex];
    if (!current || !swap) return;

    reordered[index] = { ...swap, sortOrder: current.sortOrder };
    reordered[swapIndex] = { ...current, sortOrder: swap.sortOrder };

    const response = await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentId: node.parentId ?? null,
        items: reordered.map((item, sortOrder) => ({ id: item.id, sortOrder })),
      }),
    });

    if (!response.ok) {
      adminToast.error('Não foi possível reordenar a categoria.');
      return;
    }

    await refresh();
    adminToast.success('Ordem atualizada.');
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
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
          : 'Não foi possível excluir a categoria.';
      adminToast.error(message);
      return;
    }

    setDeleteTarget(null);
    await refresh();
    adminToast.success('Categoria removida.');
  }

  function openCreate(parent: AdminCategoryTreeNode | null) {
    setEditing(null);
    setParentForCreate(parent);
    setSheetOpen(true);
  }

  function openEdit(node: AdminCategoryTreeNode) {
    setEditing(node);
    setParentForCreate(null);
    setSheetOpen(true);
  }

  return (
    <>
      <section className="cms-editor-section">
        <div className="cms-float-panel cms-vitrine-panel">
          <div className="cms-panel-head">
            <h2 className="cms-panel-title">Árvore de categorias</h2>
            <p className="cms-panel-meta">
              <strong>Taxonomia editorial</strong>
              <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                Organize silos de SEO, menus da vitrine e mapeamento futuro de marketplaces.
              </span>
            </p>
          </div>
          <div className="cms-panel-actions">
            <span className="text-sm text-[var(--admin-text-muted)]">
              <strong>{totalCount}</strong> categoria{totalCount === 1 ? '' : 's'}
            </span>
            <Button type="button" onClick={() => openCreate(null)}>
              <Plus className="mr-2 size-4" />
              Nova categoria raiz
            </Button>
          </div>
        </div>

        <div className="cms-float-panel cms-blocks-panel">
          <p className="cms-blocks-panel__meta">
            Hierarquia · <strong>{totalCount} categorias</strong>
          </p>

          {items.length > 0 ? (
            <CategoryTreeView
              nodes={items}
              onCreateChild={(parent) => openCreate(parent)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onReorder={(id, direction) => void handleReorder(id, direction)}
            />
          ) : (
            <div className="cms-empty-state rounded-lg border border-dashed p-8 text-center text-sm text-[var(--admin-text-muted)]">
              <FolderTree className="mx-auto mb-3 size-8 opacity-60" />
              Nenhuma categoria cadastrada ainda.
            </div>
          )}
        </div>
      </section>

      <CategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        treeRoots={items}
        editing={editing}
        parentForCreate={parentForCreate}
        onSaved={async () => {
          await refresh();
          setSheetOpen(false);
        }}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `A categoria "${deleteTarget.label}" será removida. Só é possível excluir nós sem filhos e sem produtos vinculados.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDelete()}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
