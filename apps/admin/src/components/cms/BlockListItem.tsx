'use client';

import { ChevronDown, ChevronUp, Settings2, Trash2 } from 'lucide-react';

import { getBlockDisplayTitle } from '@/components/cms/block-type-labels';
import { getBlockTypeMeta } from '@/components/cms/block-type-meta';
import type { AdminBlock } from '@/components/cms/normalize-positions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
  const meta = getBlockTypeMeta(block.type);
  const TypeIcon = meta.icon;

  return (
    <article className="cms-block-card">
      <div className="flex min-w-0 flex-1 items-center gap-3.5 pl-2">
        <Input
          type="number"
          min={0}
          aria-label={`Posição do bloco ${block.position + 1}`}
          value={block.position}
          onChange={(event) => onPositionChange(Number(event.target.value) || 0)}
          className="cms-position-input"
        />

        <div className="min-w-0 flex-1">
          <span className={cn('cms-type-chip', meta.accentClass)}>
            <TypeIcon className="h-3 w-3" aria-hidden />
            {block.type.replace(/_/g, ' ')}
          </span>
          <p className="cms-block-title truncate">{getBlockDisplayTitle(block.type, block.props)}</p>
          <p className="cms-block-subtitle">{meta.label}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isFirst}
            onClick={onMoveUp}
            aria-label="Mover para cima"
            className="h-8 w-8 text-[var(--admin-text-muted)] hover:text-[var(--admin-navy)]"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isLast}
            onClick={onMoveDown}
            aria-label="Mover para baixo"
            className="h-8 w-8 text-[var(--admin-text-muted)] hover:text-[var(--admin-navy)]"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className="cms-action-divider" aria-hidden />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="border-[color-mix(in_srgb,var(--admin-primary)_30%,var(--admin-gray))] hover:border-[var(--admin-primary)] hover:bg-[var(--admin-accent-muted)]"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configurar
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Excluir bloco"
          className="h-8 w-8 text-[var(--admin-text-muted)] hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}
