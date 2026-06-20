'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { ArticleCategorySummary } from '@ecommerce-amazon/shared/admin';

type ArticleCategoryListViewProps = {
  items: ArticleCategorySummary[];
  onEdit: (item: ArticleCategorySummary) => void;
  onDelete: (item: ArticleCategorySummary) => void;
};

export function ArticleCategoryListView({
  items,
  onEdit,
  onDelete,
}: ArticleCategoryListViewProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[var(--admin-text-muted)]">
        Nenhuma categoria cadastrada. Crie a primeira para organizar os artigos editoriais.
      </p>
    );
  }

  return (
    <ul className="cms-block-list">
      {items.map((item) => (
        <li key={item.id} className="cms-block-card cms-block-card--plain">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[var(--admin-navy)]">{item.name}</p>
              <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">/{item.slug}</p>
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
