'use client';

import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { deleteAdminArticleClient, listAdminArticlesClient } from '@/lib/api/articles-client';
import { ArticleStatus } from '@ecommerce-amazon/domain';
import type { AdminArticleSummary } from '@ecommerce-amazon/shared/admin';

type ArticleListManagerProps = {
  initialItems: AdminArticleSummary[];
};

function statusLabel(status: ArticleStatus): string {
  return status === ArticleStatus.PUBLISHED ? 'Publicado' : 'Rascunho';
}

export function ArticleListManager({
  initialItems,
}: ArticleListManagerProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [items, setItems] = useState(initialItems);
  const [deleteTarget, setDeleteTarget] = useState<AdminArticleSummary | null>(null);

  const refresh = useCallback(async () => {
    const nextItems = await listAdminArticlesClient();
    setItems(nextItems);
  }, []);

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      await deleteAdminArticleClient(deleteTarget.id);
      adminToast.success('Artigo excluído.');
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao excluir artigo');
    }
  }

  return (
    <section className="cms-editor-section">
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <Newspaper className="mr-2 inline h-4 w-4" />
            Artigos editoriais
          </h2>
          <p className="cms-panel-meta">
            <strong>Hub de conteúdo</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Guias, reviews e comparativos com embeds dinâmicos de produtos.
            </span>
          </p>
        </div>
        <div className="cms-panel-actions">
          <span className="text-sm text-[var(--admin-text-muted)]">
            <strong>{items.length}</strong> artigo{items.length === 1 ? '' : 's'}
          </span>
          <Button asChild>
            <Link href="/artigos/novo">
              <Plus className="mr-1 h-4 w-4" />
              Novo artigo
            </Link>
          </Button>
        </div>
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <p className="cms-blocks-panel__meta">
          Listagem editorial · <strong>{items.length} itens</strong>
        </p>

        {items.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">
            Nenhum artigo cadastrado ainda.
          </p>
        ) : (
          <ul className="cms-block-list">
            {items.map((item) => (
              <li key={item.id} className="cms-block-card cms-block-card--plain">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      /artigos/{item.slug} · {statusLabel(item.status)}
                    </p>
                    {item.excerpt ? (
                      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{item.excerpt}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/artigos/${item.id}`}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove permanentemente &quot;{deleteTarget?.title}&quot;.
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
