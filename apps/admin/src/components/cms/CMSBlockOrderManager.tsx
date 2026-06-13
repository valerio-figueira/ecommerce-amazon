'use client';

import { BlockType } from '@ecommerce-amazon/domain';
import { CheckCircle2, Layers, Plus, Save, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { BlockPropsSheet } from '@/components/cms/BlockPropsSheet';
import { BlockListItem } from '@/components/cms/BlockListItem';
import { ALL_BLOCK_TYPES, getDefaultBlockProps } from '@/components/cms/block-type-labels';
import { getBlockTypeMeta } from '@/components/cms/block-type-meta';
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
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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
  const [blockTypeFilter, setBlockTypeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminBlock | null>(null);

  const filteredBlockTypes = useMemo(() => {
    const query = blockTypeFilter.trim().toLowerCase();
    if (!query) return ALL_BLOCK_TYPES;
    return ALL_BLOCK_TYPES.filter((type) => {
      const meta = getBlockTypeMeta(type);
      return (
        type.toLowerCase().includes(query) ||
        meta.label.toLowerCase().includes(query)
      );
    });
  }, [blockTypeFilter]);

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
    setBlockTypeFilter('');
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
          current.map((block) =>
            block.id === saved.id ? { ...saved, position: block.position } : block,
          ),
        ),
      );
    }
    setStatusMessage(dialogMode === 'create' ? 'Bloco adicionado com sucesso.' : 'Propriedades atualizadas.');
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
      setStatusMessage('Bloco removido da página.');
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
      setStatusMessage('Ordem publicada na vitrine.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar ordem');
    } finally {
      setIsSavingOrder(false);
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">Vitrine</h2>
          <p className="cms-panel-meta">
            <strong>{pageTitle}</strong>
            <span className="cms-panel-slug">/{slug}</span>
          </p>
        </div>

        {(statusMessage || errorMessage) && (
          <div
            className={cn(
              'cms-status-banner',
              errorMessage ? 'is-error' : 'is-success',
            )}
            role="status"
          >
            {!errorMessage && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />}
            {errorMessage ?? statusMessage}
          </div>
        )}

        <div className="cms-panel-actions">
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
            className={cn(orderDirty && 'ring-2 ring-[var(--admin-focus-ring)] ring-offset-1')}
          >
            <Save className="h-4 w-4" />
            {isSavingOrder ? 'Publicando…' : 'Salvar ordem'}
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Blocos da página · <strong>{blocks.length}</strong>{' '}
          {blocks.length === 1 ? 'item' : 'itens'}
        </p>

        <div className="cms-block-list">
        {blocks.map((block, index) => (
          <div key={block.id} className="space-y-1.5">
            <button type="button" onClick={() => openCreateDialog(index)} className="cms-insert-slot">
              <Plus className="h-3 w-3" aria-hidden />
              Inserir aqui
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
          <div className="cms-empty-state">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-accent-muted)] text-[var(--admin-primary)]">
              <Layers className="h-5 w-5" aria-hidden />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
              Página sem blocos
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--admin-text-muted)]">
              Monte o layout editorial adicionando blocos dinâmicos, grades e conteúdo curado.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => openCreateDialog(0)}
            >
              <Sparkles className="h-4 w-4" />
              Adicionar primeiro bloco
            </Button>
          </div>
        )}

        {blocks.length > 0 && (
          <button type="button" onClick={() => openCreateDialog(blocks.length)} className="cms-insert-slot mt-1">
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Adicionar no final
          </button>
        )}
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="cms-dialog-accent max-w-xl">
          <DialogHeader>
            <DialogTitle>Escolher tipo de bloco</DialogTitle>
            <DialogDescription>
              Posição de inserção: <strong>{insertAt ?? blocks.length}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            type="search"
            value={blockTypeFilter}
            onChange={(event) => setBlockTypeFilter(event.target.value)}
            placeholder="Buscar bloco… (ex.: bento, grade, hero)"
            className="text-sm"
          />
          <div className="cms-type-picker-grid cms-type-picker-grid--scroll">
            {filteredBlockTypes.length === 0 ? (
              <p className="col-span-full py-6 text-center text-sm text-[var(--admin-text-muted)]">
                Nenhum bloco encontrado para &quot;{blockTypeFilter}&quot;.
              </p>
            ) : (
              filteredBlockTypes.map((type) => {
              const meta = getBlockTypeMeta(type);
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  className="cms-type-picker-card"
                  onClick={() => startCreateBlock(type)}
                >
                  <span className="cms-type-picker-icon">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--admin-navy-deep)]">
                      {meta.label}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[var(--admin-text-muted)]">
                      {type}
                    </span>
                  </span>
                </button>
              );
            })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BlockPropsSheet
        slug={slug}
        block={editingBlock}
        mode={dialogMode}
        insertAt={insertAt}
        open={propsDialogOpen}
        onOpenChange={setPropsDialogOpen}
        onSaved={handleBlockSaved}
        pageBlocks={blocks}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="cms-dialog-accent">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              O bloco será removido da vitrine pública. A ordem dos demais será reindexada
              automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()}>
              Excluir bloco
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
