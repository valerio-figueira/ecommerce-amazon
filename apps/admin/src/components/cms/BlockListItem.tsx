'use client';

import { Settings, Trash2 } from 'lucide-react';

import { BLOCK_TYPE_LABELS, getBlockDisplayTitle } from '@/components/cms/block-type-labels';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BlockListItemProps = {
  block: AdminBlock;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPositionChange: (position: number) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BlockListItem({
  block,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onPositionChange,
  onEdit,
  onDelete,
}: BlockListItemProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--admin-gray)] bg-white p-4 shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Input
          type="number"
          min={0}
          value={block.position}
          onChange={(event) => onPositionChange(Number(event.target.value) || 0)}
          className="h-9 w-14 shrink-0 text-center font-bold"
        />
        <div className="min-w-0">
          <span className="rounded bg-[var(--admin-bg)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--admin-text-muted)]">
            {block.type}
          </span>
          <p className="mt-1 truncate text-sm font-medium text-[var(--admin-navy)]">
            {getBlockDisplayTitle(block.type, block.props)}
          </p>
          <p className="text-xs text-[var(--admin-text-muted)]">{BLOCK_TYPE_LABELS[block.type]}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex gap-1 border-r border-[var(--admin-gray)] pr-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Mover para cima"
          >
            ↑
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Mover para baixo"
          >
            ↓
          </Button>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Settings className="h-3.5 w-3.5" />
          Configurar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Excluir bloco"
          className="text-[var(--admin-text-muted)] hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
