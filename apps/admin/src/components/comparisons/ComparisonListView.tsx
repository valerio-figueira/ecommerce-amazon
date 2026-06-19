'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AdminComparisonSummary } from '@ecommerce-amazon/shared/admin';

type ComparisonListViewProps = {
  items: AdminComparisonSummary[];
  onEdit: (item: AdminComparisonSummary) => void;
  onDelete: (item: AdminComparisonSummary) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(status: AdminComparisonSummary['status']): string {
  return status === 'published' ? 'Publicado' : 'Rascunho';
}

function sourceLabel(source: AdminComparisonSummary['source']): string {
  return source === 'curated' ? 'Curada' : 'UGC';
}

export function ComparisonListView({
  items,
  onEdit,
  onDelete,
}: ComparisonListViewProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--admin-text-muted)]">
        Nenhuma comparação cadastrada. Revise UGC ou crie um comparativo curado.
      </p>
    );
  }

  return (
    <ul className="cms-block-list">
      {items.map((item) => (
        <li key={item.id} className="cms-block-card cms-block-card--plain">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--admin-navy)]">
                {item.productTitles.join(' vs ')}
              </p>
              <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                {item.slug ? `/comparar/${item.slug}` : `token ${item.shareToken.slice(0, 8)}…`} ·{' '}
                {item.categoryLabel ?? 'Sem categoria'} · {statusLabel(item.status)} ·{' '}
                {sourceLabel(item.source)} · {formatDate(item.updatedAt)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Editar
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(item)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
