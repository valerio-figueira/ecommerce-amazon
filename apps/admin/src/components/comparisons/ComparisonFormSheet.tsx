'use client';

import { adminClientFetch } from '@/lib/api/admin-client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { ProductMultiSelect } from '@/components/collections/ProductMultiSelect';
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
import { listProductsClient } from '@/lib/api/cms-pages-client';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';
import type { AdminComparisonDetail, AdminComparisonSummary } from '@ecommerce-amazon/shared/admin';
import { adminComparisonDetailSchema } from '@ecommerce-amazon/shared/admin';
import {
  buildSuggestedComparisonSlug,
  countEditorialWords,
  MIN_EDITORIAL_WORDS,
} from '@ecommerce-amazon/shared/comparison';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ComparisonFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminComparisonSummary | null;
  onSaved: () => Promise<void>;
};

export function ComparisonFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: ComparisonFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const introRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishHint, setPublishHint] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [editorialIntro, setEditorialIntro] = useState('');
  const [slug, setSlug] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [showCategoryCarousel, setShowCategoryCarousel] = useState(true);
  const [shareToken, setShareToken] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [detailId, setDetailId] = useState<string | null>(null);

  const wordCount = useMemo(() => countEditorialWords(editorialIntro), [editorialIntro]);
  const wordProgress = Math.min(100, Math.round((wordCount / MIN_EDITORIAL_WORDS) * 100));
  const canPublish = wordCount >= MIN_EDITORIAL_WORDS && productIds.length >= 2 && slug.length > 0;

  const selectedProducts = useMemo(
    () => productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean),
    [productIds, products],
  );

  useEffect(() => {
    if (!open) return;
    void listProductsClient()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!editing) {
      setProductIds([]);
      setEditorialIntro('');
      setSlug('');
      setSeoTitle('');
      setSeoDescription('');
      setShowCategoryCarousel(true);
      setShareToken('');
      setStatus('draft');
      setDetailId(null);
      setPublishHint(null);
      return;
    }

    setLoading(true);
    void adminClientFetch(`/api/admin/comparisons/${editing.id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Falha ao carregar comparação');
        const payload: unknown = await response.json();
        const parsed = adminComparisonDetailSchema.safeParse(payload);
        if (!parsed.success) throw new Error('Falha ao carregar comparação');
        applyDetail(parsed.data);
      })
      .catch((error) => {
        adminToast.error(error instanceof Error ? error.message : 'Falha ao carregar comparação');
      })
      .finally(() => setLoading(false));
  }, [open, editing, adminToast]);

  function applyDetail(detail: AdminComparisonDetail): void {
    setDetailId(detail.id);
    setProductIds(detail.productIds);
    setEditorialIntro(detail.editorialIntro);
    setSlug(detail.slug ?? '');
    setSeoTitle(detail.seoTitle ?? '');
    setSeoDescription(detail.seoDescription ?? '');
    setShowCategoryCarousel(detail.showCategoryCarousel);
    setShareToken(detail.shareToken);
    setStatus(detail.status);
  }

  function handleProductChange(nextIds: string[]): void {
    if (nextIds.length > 3) {
      adminToast.error('Selecione no máximo 3 produtos.');
      return;
    }
    if (nextIds.length >= 2) {
      const titles = nextIds
        .map((id) => products.find((product) => product.id === id)?.title ?? '')
        .filter(Boolean);
      if (!slug.trim() && titles.length >= 2) {
        setSlug(buildSuggestedComparisonSlug(titles));
      }
    }
    setProductIds(nextIds);
  }

  function handleGenerateSlug(): void {
    const titles = selectedProducts.map((product) => product?.title ?? '').filter(Boolean);
    setSlug(buildSuggestedComparisonSlug(titles));
  }

  async function saveDraft(): Promise<string | null> {
    if (productIds.length < 2 || productIds.length > 3) {
      adminToast.error('Selecione de 2 a 3 produtos.');
      return null;
    }

    const body = {
      productIds,
      editorialIntro: editorialIntro.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      ...(seoTitle.trim() ? { seoTitle: seoTitle.trim() } : {}),
      ...(seoDescription.trim() ? { seoDescription: seoDescription.trim() } : {}),
      showCategoryCarousel,
    };

    const response = detailId
      ? await adminClientFetch(`/api/admin/comparisons/${detailId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await adminClientFetch('/api/admin/comparisons', {
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
          : 'Falha ao salvar comparação';
      throw new Error(message);
    }

    if (detailId) return detailId;

    const created: unknown = await response.json();
    if (
      typeof created === 'object' &&
      created !== null &&
      'id' in created &&
      typeof created.id === 'string'
    ) {
      setDetailId(created.id);
      return created.id;
    }
    return null;
  }

  async function handleSaveDraft(event?: React.FormEvent): Promise<void> {
    event?.preventDefault();
    setSaving(true);
    try {
      await saveDraft();
      adminToast.success('Rascunho salvo.');
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar comparação');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(): Promise<void> {
    if (wordCount < MIN_EDITORIAL_WORDS) {
      const missing = MIN_EDITORIAL_WORDS - wordCount;
      setPublishHint(
        `Adicione mais ${missing} palavra${missing === 1 ? '' : 's'} para liberar a indexação e publicação.`,
      );
      introRef.current?.focus();
      return;
    }
    if (!slug.trim() || !SLUG_PATTERN.test(slug.trim())) {
      adminToast.error('Informe um slug válido antes de publicar.');
      return;
    }

    setPublishing(true);
    try {
      const id = await saveDraft();
      if (!id) return;

      const response = await adminClientFetch(`/api/admin/comparisons/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim() }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : 'Falha ao publicar comparação';
        throw new Error(message);
      }
      adminToast.success('Comparação publicada.');
      setStatus('published');
      setPublishHint(null);
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao publicar comparação');
    } finally {
      setPublishing(false);
    }
  }

  const siteBase = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3001';
  const previewPath = slug.trim()
    ? `/comparar/${slug.trim()}`
    : shareToken
      ? `/comparar/${shareToken}`
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="cms-props-sheet flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-[var(--admin-gray)] px-6 py-5">
          <SheetTitle>{editing ? 'Editar comparação' : 'Nova comparação curada'}</SheetTitle>
          <SheetDescription>
            Revise a intro editorial, defina o slug legível e publique para indexação e sitemap.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-[var(--admin-text-muted)]">
            Carregando…
          </p>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void handleSaveDraft(event)}
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-[var(--admin-accent-subtle)] px-2 py-0.5 font-medium">
                  {status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
                {shareToken ? (
                  <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px]">
                    token: {shareToken}
                  </code>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Produtos (2–3, mesma categoria)</Label>
                <ProductMultiSelect
                  products={products}
                  value={productIds}
                  onChange={handleProductChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison-intro">Intro editorial</Label>
                <Textarea
                  ref={introRef}
                  id="comparison-intro"
                  value={editorialIntro}
                  onChange={(event) => {
                    setEditorialIntro(event.target.value);
                    setPublishHint(null);
                  }}
                  rows={8}
                  placeholder="Texto introdutório revisado pelo operador…"
                />
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[var(--admin-text-muted)]">
                    <span>
                      {wordCount} / {MIN_EDITORIAL_WORDS} palavras
                    </span>
                    <span>{wordProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className="h-full rounded-full bg-[var(--admin-navy)] transition-all"
                      style={{ width: `${wordProgress}%` }}
                    />
                  </div>
                  {publishHint ? (
                    <p className="text-xs text-[var(--admin-danger,#dc3545)]">{publishHint}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="comparison-slug">Slug (obrigatório na publicação)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleGenerateSlug}>
                    Gerar do título
                  </Button>
                </div>
                <Input
                  id="comparison-slug"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="produto-a-vs-produto-b"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison-seo-title">SEO title (opcional)</Label>
                <Input
                  id="comparison-seo-title"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison-seo-description">SEO description (opcional)</Label>
                <Textarea
                  id="comparison-seo-description"
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  rows={2}
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCategoryCarousel}
                  onChange={(event) => setShowCategoryCarousel(event.target.checked)}
                />
                Exibir carrossel da categoria abaixo da tabela
              </label>

              {previewPath ? (
                <a
                  href={`${siteBase}${previewPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-[var(--admin-navy)] underline-offset-2 hover:underline"
                >
                  Abrir na vitrine ↗
                </a>
              ) : null}
            </div>

            <SheetFooter className="shrink-0 border-t border-[var(--admin-gray)] px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="outline" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar rascunho'}
              </Button>
              <Button
                type="button"
                disabled={!canPublish || publishing}
                onClick={() => void handlePublish()}
              >
                {publishing ? 'Publicando…' : 'Publicar'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
