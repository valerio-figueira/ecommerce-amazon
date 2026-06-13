'use client';

import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  buildCategoryParentOptions,
  collectCategoryDescendantIds,
  formatParentOptionLabel,
} from '@/lib/api/categories-utils';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
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
import {
  buildCategorySeoDescription,
  buildCategorySeoTitle,
} from '@ecommerce-amazon/shared/seo';

import { CategoryFieldHint } from './CategoryFieldHint';
import { CategoryLlmPromptHelper } from './CategoryLlmPromptHelper';

type CategoryFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treeRoots: AdminCategoryTreeNode[];
  editing: AdminCategoryTreeNode | null;
  parentForCreate: AdminCategoryTreeNode | null;
  onSaved: () => Promise<void>;
};

function resolveParentPathLabel(
  parentId: string | null,
  parentOptions: ReturnType<typeof buildCategoryParentOptions>,
): string | null {
  if (!parentId) {
    return null;
  }
  return parentOptions.find((option) => option.id === parentId)?.pathLabel ?? null;
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  treeRoots,
  editing,
  parentForCreate,
  onSaved,
}: CategoryFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
  const [showSlugField, setShowSlugField] = useState(false);
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

    slugTouched.current = false;
    setShowSlugField(Boolean(editing));

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

  const parentPathLabel = useMemo(
    () => resolveParentPathLabel(parentId, parentOptions),
    [parentId, parentOptions],
  );

  const resolvedSlug = slug.trim() || slugifyTitle(label);
  const autoSeoTitle = label.trim() ? buildCategorySeoTitle(label) : '—';
  const autoSeoDescription = label.trim()
    ? buildCategorySeoDescription(label, parentPathLabel?.split(' → ').at(-1) ?? null)
    : '—';

  function handleLabelChange(value: string) {
    setLabel(value);
    if (!slugTouched.current) {
      setSlug(slugifyTitle(value));
    }
  }

  function handleRegenerateSlug() {
    slugTouched.current = false;
    setSlug(slugifyTitle(label));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const body = {
      label: label.trim(),
      slug: resolvedSlug,
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
      <SheetContent side="right" className="cms-props-sheet flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-[var(--admin-gray)] px-6 py-5">
          <SheetTitle>{editing ? 'Editar categoria' : 'Nova categoria'}</SheetTitle>
          <SheetDescription>
            Preencha nome e hierarquia; slug e SEO têm sugestões automáticas. Campos de marketplace
            são opcionais para automação futura.
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <fieldset className="m-0 min-w-0 space-y-4 border-0 p-0">
            <legend className="text-sm font-semibold text-[var(--admin-navy)]">Identificação</legend>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-label">Nome</Label>
                <CategoryFieldHint text="Nome exibido no menu, breadcrumbs e título da página. Use termos que o visitante buscaria no Google." />
              </div>
              <Input
                id="category-label"
                value={label}
                onChange={(event) => handleLabelChange(event.target.value)}
                placeholder="Ex.: Teclados Mecânicos"
                required
              />
              {!showSlugField ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--admin-text-muted)]">
                  <span>
                    URL:{' '}
                    <code className="rounded bg-[var(--admin-accent-subtle)] px-1.5 py-0.5 font-mono">
                      /categorias/{resolvedSlug || '…'}
                    </code>
                  </span>
                  <button
                    type="button"
                    className="text-[var(--admin-navy)] underline-offset-2 hover:underline"
                    onClick={() => setShowSlugField(true)}
                  >
                    Personalizar slug
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="category-slug">Slug</Label>
                      <CategoryFieldHint text="Identificador da URL em kebab-case. Evite alterar após publicar — links e SEO podem quebrar." />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={handleRegenerateSlug}
                      disabled={!label.trim()}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Usar slug do nome
                    </Button>
                  </div>
                  <Input
                    id="category-slug"
                    value={slug}
                    onChange={(event) => {
                      slugTouched.current = true;
                      setSlug(event.target.value);
                    }}
                    placeholder="teclados-mecanicos"
                  />
                  {editing ? (
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Alterar o slug muda a URL pública. Configure redirecionamento se necessário.
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-parent">Categoria pai</Label>
                <CategoryFieldHint text="Define a hierarquia no menu e breadcrumbs. Produtos devem ficar na folha (subcategoria mais específica)." />
              </div>
              <Select
                value={parentId ?? '__root__'}
                onValueChange={(value) => setParentId(value === '__root__' ? null : value)}
              >
                <SelectTrigger id="category-parent">
                  <SelectValue placeholder="Raiz (sem pai)" />
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
              <div className="flex items-center gap-2">
                <Label htmlFor="category-icon">Ícone</Label>
                <CategoryFieldHint text="Emoji (🎮) ou nome de ícone Lucide para pills e menu. Opcional." />
              </div>
              <Input
                id="category-icon"
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                placeholder="Ex.: keyboard ou ⌨️"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] px-3 py-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-visible">Visível na vitrine</Label>
                <CategoryFieldHint text="Oculte rascunhos ou categorias internas sem excluir da árvore." />
              </div>
              <Switch id="category-visible" checked={visible} onCheckedChange={setVisible} />
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t border-[var(--admin-gray)] p-0 pt-4">
            <div className="flex items-center justify-between gap-2">
              <legend className="text-sm font-semibold text-[var(--admin-navy)]">SEO</legend>
              <CategoryLlmPromptHelper
                label={label}
                parentPathLabel={parentPathLabel}
                autoSeoTitle={autoSeoTitle}
                autoSeoDescription={autoSeoDescription}
                seoTitle={seoTitle}
                seoDescription={seoDescription}
                descriptionHtml={descriptionHtml}
              />
            </div>

            <p className="rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] px-4 py-3 text-xs text-[var(--admin-text-muted)]">
              Campos vazios usam templates automáticos na vitrine. Preencha apenas para sobrescrever.
            </p>

            <div className="space-y-2 rounded-lg border border-dashed border-[var(--admin-gray)] px-4 py-3 text-xs text-[var(--admin-text-muted)]">
              <p>
                <strong className="text-[var(--admin-navy)]">Automático — Title:</strong> {autoSeoTitle}
              </p>
              <p>
                <strong className="text-[var(--admin-navy)]">Automático — Description:</strong>{' '}
                {autoSeoDescription}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-seo-title">SEO title (opcional)</Label>
                <CategoryFieldHint text="Título da aba e do Google. Ideal: palavra-chave + benefício, até ~60 caracteres visíveis." />
              </div>
              <Input
                id="category-seo-title"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                placeholder={label.trim() ? autoSeoTitle : 'Deixe vazio para usar o título automático'}
                maxLength={150}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-seo-description">SEO description (opcional)</Label>
                <CategoryFieldHint text="Snippet nos resultados de busca. Alvo: 140–160 caracteres, mencione curadoria e comparação de preços." />
              </div>
              <Textarea
                id="category-seo-description"
                rows={4}
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                placeholder={
                  label.trim() ? autoSeoDescription : 'Deixe vazio para usar a descrição automática'
                }
                maxLength={2000}
              />
              <p className="text-xs text-[var(--admin-text-muted)]">
                {seoDescription.trim().length}/2000 caracteres
                {seoDescription.trim().length > 0 && seoDescription.trim().length <= 160
                  ? ' · bom tamanho para snippet'
                  : ''}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category-description-html">Conteúdo HTML (rodapé da listagem)</Label>
                <CategoryFieldHint text="Texto editorial no fim da página /categorias/slug. Melhora SEO e contexto para o visitante. Use o ícone ✨ para prompt de IA." />
              </div>
              <Textarea
                id="category-description-html"
                rows={8}
                className="font-mono text-xs leading-relaxed"
                value={descriptionHtml}
                onChange={(event) => setDescriptionHtml(event.target.value)}
                placeholder="<h2>Sobre teclados mecânicos</h2><p>Texto introdutório sobre a categoria...</p>"
              />
            </div>
          </fieldset>

          <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t border-[var(--admin-gray)] p-0 pt-4">
            <legend className="text-sm font-semibold text-[var(--admin-navy)]">
              Integração marketplace (opcional)
            </legend>
            <p className="text-xs text-[var(--admin-text-muted)]">
              IDs para mapeamento futuro com APIs de afiliado. Não afetam a vitrine hoje.
            </p>

            <div className="grid gap-3 sm:grid-cols-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-amazon">Amazon browse node</Label>
                  <CategoryFieldHint text="ID numérico da categoria na Amazon BR (browse node). Usado pelo worker para sync futuro." />
                </div>
                <Input
                  id="category-amazon"
                  value={amazonBrowseNode}
                  onChange={(event) => setAmazonBrowseNode(event.target.value)}
                  placeholder="Ex.: 16339926011"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-ml">Mercado Livre category ID</Label>
                  <CategoryFieldHint text="ID da categoria no Mercado Livre para de/para automático." />
                </div>
                <Input
                  id="category-ml"
                  value={mercadolivreCategoryId}
                  onChange={(event) => setMercadolivreCategoryId(event.target.value)}
                  placeholder="Ex.: MLB1234"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-shopee">Shopee category ID</Label>
                  <CategoryFieldHint text="ID da categoria na Shopee BR para de/para automático." />
                </div>
                <Input
                  id="category-shopee"
                  value={shopeeCategoryId}
                  onChange={(event) => setShopeeCategoryId(event.target.value)}
                  placeholder="Ex.: 100641"
                />
              </div>
            </div>
          </fieldset>
          </div>

          <SheetFooter className="shrink-0 px-6 py-4">
            <Button type="submit" disabled={saving || !label.trim()} className="w-full sm:w-auto">
              {saving ? 'Salvando...' : 'Salvar categoria'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
