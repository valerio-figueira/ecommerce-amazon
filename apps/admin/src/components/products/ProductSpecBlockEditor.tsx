'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ProductSpecPropertyRow } from '@/components/products/ProductSpecPropertyRow';
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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SpecBlockState } from '@/lib/product-specs-form-state';
import {
  createEmptyPropertyRow,
  updateBlockTitle,
} from '@/lib/product-specs-form-state';

type ProductSpecBlockEditorProps = {
  block: SpecBlockState;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onBlockChange: (blockId: string, nextBlock: SpecBlockState) => void;
  onRemoveBlock: (blockId: string) => void;
  onMoveBlock: (blockId: string, direction: -1 | 1) => void;
  onBlurSync: () => void;
  onStructuralChange: () => void;
};

export function ProductSpecBlockEditor({
  block,
  canMoveUp,
  canMoveDown,
  onBlockChange,
  onRemoveBlock,
  onMoveBlock,
  onBlurSync,
  onStructuralChange,
}: ProductSpecBlockEditorProps): React.JSX.Element {
  const [deleteOpen, setDeleteOpen] = useState(false);

  function updateBlock(nextBlock: SpecBlockState, structural = false): void {
    onBlockChange(block.id, nextBlock);
    if (structural) {
      onStructuralChange();
    }
  }

  function updateProperty(rowId: string, key: string, value: string): void {
    updateBlock({
      ...block,
      properties: block.properties.map((row) =>
        row.id === rowId ? { ...row, key, value } : row,
      ),
    });
  }

  function addProperty(): void {
    updateBlock(
      {
        ...block,
        properties: [...block.properties, createEmptyPropertyRow()],
      },
      true,
    );
  }

  function removeProperty(rowId: string): void {
    const nextProperties = block.properties.filter((row) => row.id !== rowId);
    updateBlock(
      {
        ...block,
        properties: nextProperties.length > 0 ? nextProperties : [createEmptyPropertyRow()],
      },
      true,
    );
  }

  return (
    <div className="cms-block-card cms-block-card--plain space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`spec-block-title-${block.id}`}>Título do bloco</Label>
            <Input
              id={`spec-block-title-${block.id}`}
              placeholder="Ex: Detalhes do Produto"
              value={block.group_title}
              onChange={(event) =>
                updateBlock(updateBlockTitle(block, event.target.value))
              }
              onBlur={onBlurSync}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`spec-block-collapsed-${block.id}`}
              checked={block.is_collapsed_default}
              onCheckedChange={(checked) => {
                updateBlock({ ...block, is_collapsed_default: checked }, true);
              }}
            />
            <Label htmlFor={`spec-block-collapsed-${block.id}`} className="font-normal">
              Iniciar recolhido na vitrine
            </Label>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => onMoveBlock(block.id, -1)}
            aria-label="Mover bloco para cima"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => onMoveBlock(block.id, 1)}
            aria-label="Mover bloco para baixo"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Excluir bloco"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 border-t border-[var(--admin-gray)] pt-4">
        {block.properties.map((row) => (
          <ProductSpecPropertyRow
            key={row.id}
            row={row}
            onChange={updateProperty}
            onBlur={onBlurSync}
            onRemove={removeProperty}
          />
        ))}

        <Button type="button" variant="ghost" size="sm" onClick={addProperty}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Adicionar atributo
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir bloco de especificações?</AlertDialogTitle>
            <AlertDialogDescription>
              O bloco &quot;{block.group_title || 'Sem título'}&quot; e todos os atributos serão
              removidos do formulário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemoveBlock(block.id);
                onStructuralChange();
                setDeleteOpen(false);
              }}
            >
              Excluir bloco
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
