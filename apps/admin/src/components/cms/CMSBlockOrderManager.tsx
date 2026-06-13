'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { BlockPropsDialog } from '@/components/cms/BlockPropsDialog';
import { BlockListItem } from '@/components/cms/BlockListItem';
import {
  ALL_BLOCK_TYPES,
  BLOCK_TYPE_LABELS,
  getDefaultBlockProps,
} from '@/components/cms/block-type-labels';
import {
  normalizePositions,
  toAdminBlocks,
  type AdminBlock,
} from '@/components/cms/normalize-positions';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  deletePageBlockClient,
  fetchAdminPageLayoutClient,
  reorderPageBlocksClient,
} from '@/lib/api/cms-pages-client';
import type { PageBlockDto } from '@ecommerce-amazon/shared/cms';

type CMSBlockOrderManagerProps = {
  slug: string;
  pageTitle: string;
  initialBlocks: PageBlockDto[];
};

export function CMSBlockOrderManager({
  slug,
  pageTitle,
  initialBlocks,
}: CMSBlockOrderManagerProps): React.JSX.Element {
  const [blocks, setBlocks] = useState<AdminBlock[]>(() => toAdminBlocks(initialBlocks));
  const [orderDirty, setOrderDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editingBlock, setEditingBlock] = useState<AdminBlock | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('edit');
  const [propsDialogOpen, setPropsDialogOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlock | null>(null);

  function updateBlocks(next: AdminBlock[], markDirty = false): void {
    setBlocks(normalizePositions(next));
    if (markDirty) setOrderDirty(true);
  }

  function handleMove(blockId: string, direction: -1 | 1): void {
    const index = blocks.findIndex((block) => block.id === blockId);
    if (index < 0) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const next = [...blocks];
    const current = next[index];
    const target = next[targetIndex];
    if (!current || !target) return;

    next[index] = { ...target, position: current.position };
    next[targetIndex] = { ...current, position: target.position };
    updateBlocks(next, true);
  }

  function handlePositionChange(blockId: string, position: number): void {
    updateBlocks(
      blocks.map((block) => (block.id === blockId ? { ...block, position } : block)),
      true,
    );
  }

  function openCreateDialog(at: number | null): void {
    setInsertAt(at);
    setAddDialogOpen(true);
  }

  function startCreateBlock(type: BlockType): void {
    setAddDialogOpen(false);
    const draftBlock: AdminBlock = {
      id: 'draft',
      type,
      sortOrder: insertAt ?? blocks.length,
      position: insertAt ?? blocks.length,
      visibility: 'all',
      props: getDefaultBlockProps(type),
    };
    setEditingBlock(draftBlock);
    setDialogMode('create');
    setPropsDialogOpen(true);
  }

  function handleBlockSaved(saved: AdminBlock): void {
    if (dialogMode === 'create') {
      void refreshBlocksAfterMutation();
    } else {
      setBlocks((current) =>
        normalizePositions(
          current.map((block) => (block.id === saved.id ? { ...saved, position: block.position } : block)),
        ),
      );
    }
    setStatusMessage(dialogMode === 'create' ? 'Bloco adicionado.' : 'Propriedades salvas.');
    setErrorMessage(null);
  }

  async function refreshBlocksAfterMutation(): Promise<void> {
    const layout = await fetchAdminPageLayoutClient(slug);
    setBlocks(toAdminBlocks(layout.blocks));
    setOrderDirty(false);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      const remaining = await deletePageBlockClient(slug, deleteTarget.id);
      setBlocks(toAdminBlocks(remaining));
      setOrderDirty(false);
      setStatusMessage('Bloco removido.');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao excluir bloco');
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleSaveOrder(): Promise<void> {
    setIsSavingOrder(true);
    setErrorMessage(null);
    try {
      const updated = await reorderPageBlocksClient(
        slug,
        blocks.map((block) => ({ blockId: block.id, position: block.position })),
      );
      setBlocks(toAdminBlocks(updated));
      setOrderDirty(false);
      setStatusMessage('Ordem salva.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar ordem');
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-bg)] p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-navy)]">{pageTitle}</p>
          <p className="text-xs text-[var(--admin-text-muted)]">
            {blocks.length} bloco{blocks.length === 1 ? '' : 's'} na página
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => openCreateDialog(blocks.length)}>
            <Plus className="h-4 w-4" />
            Adicionar bloco
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!orderDirty || isSavingOrder || blocks.length === 0}
            onClick={() => void handleSaveOrder()}
          >
            {isSavingOrder ? 'Salvando…' : 'Salvar ordem'}
          </Button>
        </div>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            errorMessage
              ? 'border border-red-200 bg-red-50 text-red-700'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-2">
            <button
              type="button"
              onClick={() => openCreateDialog(index)}
              className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[var(--admin-gray)] py-1.5 text-xs font-medium text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Inserir bloco aqui
            </button>
            <BlockListItem
              block={block}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
              onMoveUp={() => handleMove(block.id, -1)}
              onMoveDown={() => handleMove(block.id, 1)}
              onPositionChange={(position) => handlePositionChange(block.id, position)}
              onEdit={() => {
                setEditingBlock(block);
                setDialogMode('edit');
                setPropsDialogOpen(true);
              }}
              onDelete={() => setDeleteTarget(block)}
            />
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="rounded-lg border border-dashed border-[var(--admin-gray)] bg-white p-8 text-center">
            <p className="text-sm text-[var(--admin-text-muted)]">Nenhum bloco nesta página.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => openCreateDialog(0)}
            >
              Adicionar primeiro bloco
            </Button>
          </div>
        )}

        {blocks.length > 0 && (
          <button
            type="button"
            onClick={() => openCreateDialog(blocks.length)}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[var(--admin-gray)] py-2 text-xs font-medium text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar bloco no final
          </button>
        )}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolher tipo de bloco</DialogTitle>
            <DialogDescription>
              Posição de inserção: {insertAt ?? blocks.length}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ALL_BLOCK_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                className="h-auto justify-start px-3 py-3 text-left"
                onClick={() => startCreateBlock(type)}
              >
                <span className="block font-semibold">{BLOCK_TYPE_LABELS[type]}</span>
                <span className="block font-mono text-[10px] text-[var(--admin-text-muted)]">
                  {type}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BlockPropsDialog
        slug={slug}
        block={editingBlock}
        mode={dialogMode}
        insertAt={insertAt}
        open={propsDialogOpen}
        onOpenChange={setPropsDialogOpen}
        onSaved={handleBlockSaved}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este bloco do site? A ordem será reindexada
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
