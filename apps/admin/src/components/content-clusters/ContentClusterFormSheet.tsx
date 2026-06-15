'use client';

import { useEffect, useRef, useState } from 'react';

import { ArticleIdPicker } from '@/components/cms/props-forms/ArticleIdPicker';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAdminToast } from '@/components/ui/admin-toast';
import {
  createContentClusterClient,
  getContentClusterClient,
  updateContentClusterClient,
} from '@/lib/api/content-clusters-client';
import { listAdminArticlesClient } from '@/lib/api/cms-pages-client';
import type { AdminArticlePickerOption } from '@/lib/api/cms-pages-client';
import type { ContentClusterAdminSummary } from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

type ContentClusterFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ContentClusterAdminSummary | null;
  onSaved: () => Promise<void>;
};

export function ContentClusterFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: ContentClusterFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [pilarArticleId, setPilarArticleId] = useState('');
  const [articles, setArticles] = useState<AdminArticlePickerOption[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    void listAdminArticlesClient()
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    slugTouched.current = false;

    if (!editing) {
      setName('');
      setSlug('');
      setDescription('');
      setPilarArticleId('');
      return;
    }

    setName(editing.name);
    setSlug(editing.slug);
    setDescription('');
    setPilarArticleId('');
    setLoadingDetail(true);

    void getContentClusterClient(editing.id)
      .then((detail) => {
        setDescription(detail.description ?? '');
        setPilarArticleId(detail.pilarArticleId ?? '');
      })
      .catch(() => {
        adminToast.error('Falha ao carregar detalhes do cluster.');
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, [open, editing, adminToast]);

  function handleNameChange(value: string): void {
    setName(value);
    if (!slugTouched.current) {
      setSlug(slugifyTitle(value));
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        description: description.trim() === '' ? null : description.trim(),
        pilarArticleId: pilarArticleId === '' ? null : pilarArticleId,
      };

      if (editing) {
        await updateContentClusterClient(editing.id, payload);
        adminToast.success('Cluster atualizado.');
      } else {
        await createContentClusterClient(payload);
        adminToast.success('Cluster criado.');
      }
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar cluster');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? 'Editar cluster' : 'Novo cluster'}</SheetTitle>
          <SheetDescription>
            Clusters Hub &amp; Spoke agrupam artigos satélite em torno de um guia pilar para SEO e
            recirculação na vitrine.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-cluster-name">Nome</Label>
            <Input
              id="content-cluster-name"
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-cluster-slug">Slug</Label>
            <Input
              id="content-cluster-slug"
              value={slug}
              onChange={(event) => {
                slugTouched.current = true;
                setSlug(event.target.value);
              }}
              placeholder="ex: especial-cadeira-ergonomica"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content-cluster-description">Descrição</Label>
            <Textarea
              id="content-cluster-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Resumo exibido no índice do guia na vitrine."
            />
          </div>
          <div className="space-y-2">
            <Label>Artigo pilar (hub)</Label>
            {loadingDetail && editing ? (
              <p className="text-sm text-[var(--admin-text-muted)]">Carregando…</p>
            ) : (
              <ArticleIdPicker
                articles={articles}
                value={pilarArticleId}
                onChange={setPilarArticleId}
                placeholder="Escolha o artigo pilar"
              />
            )}
            <p className="text-xs text-[var(--admin-text-muted)]">
              Satélites são vinculados pelo campo &quot;Cluster&quot; no formulário de cada artigo.
            </p>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={saving || loadingDetail}
            onClick={() => void handleSave()}
          >
            {saving ? 'Salvando…' : editing ? 'Guardar' : 'Criar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
