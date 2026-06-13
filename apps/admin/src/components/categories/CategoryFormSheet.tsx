'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  buildCategoryParentOptions,
  collectCategoryDescendantIds,
  formatParentOptionLabel,
} from '@/lib/api/categories-utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAdminToast } from '@/components/ui/admin-toast';
import type { AdminCategoryTreeNode } from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

type CategoryFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeRoots: AdminCategoryTreeNode[];
  editing: AdminCategoryTreeNode | null;
  parentForCreate: AdminCategoryTreeNode | null;
  onSaved: () => Promise<void>;
};

export function CategoryFormSheet({
  open,
  onOpenChange,
  treeRoots,
  editing,
  parentForCreate,
  onSaved,
}: CategoryFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [amazonBrowseNode, setAmazonBrowseNode] = useState('');
  const [mercadolivreCategoryId, setMercadolivreCategoryId] = useState('');
  const [shopeeCategoryId, setShopeeCategoryId] = useState('');
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setLabel(editing.label);
      setSlug(editing.slug);
      setIcon(editing.icon ?? '');
      setParentId(editing.parentId ?? null);
      setSeoTitle(editing.seoTitle ?? '');
      setSeoDescription(editing.seoDescription ?? '');
      setDescriptionHtml(editing.descriptionHtml ?? '');
      setAmazonBrowseNode(editing.amazonBrowseNode ?? '');
      setMercadolivreCategoryId(editing.mercadolivreCategoryId ?? '');
      setShopeeCategoryId(editing.shopeeCategoryId ?? '');
      setVisible(editing.visible);
      return;
    }

    setLabel('');
    setSlug('');
    setIcon('');
    setParentId(parentForCreate?.id ?? null);
    setSeoTitle('');
    setSeoDescription('');
    setDescriptionHtml('');
    setAmazonBrowseNode('');
    setMercadolivreCategoryId('');
    setShopeeCategoryId('');
    setVisible(true);
  }, [open, editing, parentForCreate]);

  const parentOptions = useMemo(() => {
    const excludeIds = new Set<string>();
    if (editing) {
      excludeIds.add(editing.id);
      for (const id of collectCategoryDescendantIds(editing.id, treeRoots)) {
        excludeIds.add(id);
      }
    }
    return buildCategoryParentOptions(treeRoots, excludeIds);
  }, [editing, treeRoots]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const body = {
      label: label.trim(),
      slug: slug.trim() || slugifyTitle(label),
      icon: icon.trim() || undefined,
      parentId,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      descriptionHtml: descriptionHtml.trim() || undefined,
      amazonBrowseNode: amazonBrowseNode.trim() || undefined,
      mercadolivreCategoryId: mercadolivreCategoryId.trim() || undefined,
      shopeeCategoryId: shopeeCategoryId.trim() || undefined,
      visible,
    };

    try {
      const response = editing
        ? await fetch(`/api/admin/categories/${editing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : 'Não foi possível salvar a categoria.';
        throw new Error(message);
      }

      await onSaved();
      adminToast.success(editing ? 'Categoria atualizada.' : 'Categoria criada.');
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Erro ao salvar categoria.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editing ? 'Editar categoria' : 'Nova categoria'}</SheetTitle>
          <SheetDescription>
            Preencha os metadados editoriais e IDs de marketplace para automação futura.
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="category-label">Nome</Label>
            <Input
              id="category-label"
              value={label}
              onChange={(event) => {
                setLabel(event.target.value);
                if (!editing && !slug) {
                  setSlug(slugifyTitle(event.target.value));
                }
              }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-slug">Slug</Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-parent">Categoria pai</Label>
            <Select
              value={parentId ?? '__root__'}
              onValueChange={(value) => setParentId(value === '__root__' ? null : value)}
            >
              <SelectTrigger id="category-parent">
                <SelectValue placeholder="Raiz" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__root__">Raiz (sem pai)</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id} title={option.pathLabel}>
                    <span className="font-mono text-xs text-[var(--admin-text-muted)]">
                      {formatParentOptionLabel(option)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-icon">Ícone (emoji ou Lucide)</Label>
            <Input id="category-icon" value={icon} onChange={(event) => setIcon(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-seo-title">SEO title</Label>
            <Input
              id="category-seo-title"
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-seo-description">SEO description</Label>
            <textarea
              id="category-seo-description"
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description-html">Conteúdo HTML (rodapé da listagem)</Label>
            <textarea
              id="category-description-html"
              className="min-h-28 w-full rounded-md border px-3 py-2 text-sm font-mono"
              value={descriptionHtml}
              onChange={(event) => setDescriptionHtml(event.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category-amazon">Amazon browse node</Label>
              <Input
                id="category-amazon"
                value={amazonBrowseNode}
                onChange={(event) => setAmazonBrowseNode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-ml">Mercado Livre ID</Label>
              <Input
                id="category-ml"
                value={mercadolivreCategoryId}
                onChange={(event) => setMercadolivreCategoryId(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-shopee">Shopee ID</Label>
              <Input
                id="category-shopee"
                value={shopeeCategoryId}
                onChange={(event) => setShopeeCategoryId(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <Label htmlFor="category-visible">Visível na vitrine</Label>
            <Switch id="category-visible" checked={visible} onCheckedChange={setVisible} />
          </div>

          <SheetFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar categoria'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
