'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';

import { ArticleFieldHint } from '@/components/articles/ArticleFieldHint';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { AdminAutoLinkSummary, AutoLinkApplyToValue } from '@ecommerce-amazon/shared/admin';
import {
  isManualTargetUrl,
  resolveInternalLinkLabel,
  resolveManualTargetLabel,
  type InternalLinkTarget,
} from '@/lib/internal-link-targets';
import { cn } from '@/lib/utils';

type AutoLinkListViewProps = {
  items: AdminAutoLinkSummary[];
  targets: InternalLinkTarget[];
  togglingId: string | null;
  onEdit: (item: AdminAutoLinkSummary) => void;
  onDelete: (item: AdminAutoLinkSummary) => void;
  onToggleActive: (item: AdminAutoLinkSummary, isActive: boolean) => void;
  onCreate: () => void;
};

const APPLY_TO_LABELS: Record<AutoLinkApplyToValue, string> = {
  articles: 'Artigos',
  products: 'Produtos',
  both: 'Artigos + produtos',
};

export function AutoLinkListView({
  items,
  targets,
  togglingId,
  onEdit,
  onDelete,
  onToggleActive,
  onCreate,
}: AutoLinkListViewProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <div className="cms-empty-state py-8">
        <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">
          Nenhuma keyword cadastrada
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs text-[var(--admin-text-muted)]">
          Crie regras para linkar termos automaticamente nos artigos editoriais publicados.
        </p>
        <Button type="button" variant="primary" size="sm" className="mt-4" onClick={onCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Criar primeira keyword
        </Button>
      </div>
    );
  }

  return (
    <ul className="cms-block-list">
      {items.map((item) => {
        const resolved = resolveInternalLinkLabel(item.targetUrl, targets);
        const manual = isManualTargetUrl(item.targetUrl);
        const manualLabel = manual ? resolveManualTargetLabel(item.targetUrl) : null;

        return (
          <li key={item.id} className="cms-block-card cms-block-card--plain">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-[var(--admin-navy)]">{item.keyword}</p>
                  <span
                    className={cn('cms-status-pill', item.isActive ? 'is-published' : 'is-draft')}
                  >
                    {item.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="cms-status-pill is-published">
                    {APPLY_TO_LABELS[item.applyTo]}
                  </span>
                  {resolved ? (
                    <span className="cms-status-pill is-published">{resolved.typeLabel}</span>
                  ) : manual ? (
                    <span className="cms-status-pill is-draft">{manualLabel ?? 'Manual'}</span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-[var(--admin-navy)]">
                  {resolved?.label ?? item.targetUrl}
                </p>
                {resolved ? (
                  <p className="mt-0.5 truncate font-mono text-xs text-[var(--admin-text-muted)]">
                    {item.targetUrl}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                  Prioridade <strong>{item.priority}</strong> · Máx.{' '}
                  <strong>{item.maxMatches}</strong> ocorrência
                  {item.maxMatches === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                  <Switch
                    checked={item.isActive}
                    disabled={togglingId === item.id}
                    onCheckedChange={(checked) => onToggleActive(item, checked)}
                    aria-label={`Ativar regra ${item.keyword}`}
                  />
                  Ativo
                </label>
                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AutoLinkFieldHint({ text }: { text: string }): React.JSX.Element {
  return <ArticleFieldHint text={text} />;
}
