'use client';

import { useEffect, useRef, useState } from 'react';

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
import { useAdminToast } from '@/components/ui/admin-toast';
import { listProductsClient } from '@/lib/api/cms-pages-client';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';
import type { AdminCollectionSummary } from '@ecommerce-amazon/shared/admin';
import { adminCollectionSchema } from '@ecommerce-amazon/shared/admin';
import { slugifyTitle } from '@ecommerce-amazon/shared/marketplace';

import { CollectionCoverField } from './CollectionCoverField';
import { CollectionFieldHint } from './CollectionFieldHint';
import { ProductMultiSelect } from './ProductMultiSelect';

type CollectionFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminCollectionSummary | null;
  onSaved: () => Promise<void>;
};

const CAMPAIGN_ORIGINS = [
  { value: 'organico', label: 'Orgânico' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getCampaignUtmSuggestions(
  origin: string,
): { utmSource?: string; utmMedium?: string } {
  switch (origin) {
    case 'pinterest':
      return { utmSource: 'pinterest', utmMedium: 'social' };
    case 'tiktok':
      return { utmSource: 'tiktok', utmMedium: 'social' };
    case 'instagram':
      return { utmSource: 'instagram', utmMedium: 'social' };
    default:
      return {};
  }
}

export function CollectionFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: CollectionFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
  const [showSlugField, setShowSlugField] = useState(false);
  const [products, setProducts] = useState<ProductPickerOption[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [campaignOrigin, setCampaignOrigin] = useState<string>('organico');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [ctaText, setCtaText] = useState('Ver coleção');
  const [productIds, setProductIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const resolvedSlug = slug.trim() || slugifyTitle(title);

  useEffect(() => {
    if (!open) return;
    void listProductsClient({ pageSize: 100 }).then(setProducts);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    slugTouched.current = false;
    setShowSlugField(Boolean(editing));

    if (!editing) {
      setTitle('');
      setSlug('');
      setDescription('');
      setCoverImageUrl('');
      setCampaignOrigin('organico');
      setUtmSource('');
      setUtmMedium('');
      setUtmCampaign('');
      setCtaText('Ver coleção');
      setProductIds([]);
      return;
    }

    setLoading(true);
    void fetch(`/api/admin/collections/${editing.id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Falha ao carregar coleção');
        const payload: unknown = await response.json();
        const parsed = adminCollectionSchema.safeParse(payload);
        if (!parsed.success) throw new Error('Dados inválidos');
        const collection = parsed.data;
        setTitle(collection.title);
        setSlug(collection.slug);
        setDescription(collection.description);
        setCoverImageUrl(collection.coverImageUrl);
        setCampaignOrigin(collection.campaignOrigin);
        setUtmSource(collection.utmDefaults['utm_source'] ?? '');
        setUtmMedium(collection.utmDefaults['utm_medium'] ?? '');
        setUtmCampaign(collection.utmDefaults['utm_campaign'] ?? '');
        setCtaText(collection.ctaText);
        setProductIds(collection.productIds);
      })
      .catch(() => {
        adminToast.error('Não foi possível carregar a coleção.');
        onOpenChange(false);
      })
      .finally(() => setLoading(false));
  }, [open, editing, adminToast, onOpenChange]);

  function handleTitleChange(nextTitle: string): void {
    setTitle(nextTitle);
    if (!slugTouched.current && !editing) {
      setSlug(slugifyTitle(nextTitle));
    }
  }

  function handleCampaignOriginChange(nextOrigin: string): void {
    setCampaignOrigin(nextOrigin);
    const suggestions = getCampaignUtmSuggestions(nextOrigin);

    if (!utmSource.trim() && suggestions.utmSource) {
      setUtmSource(suggestions.utmSource);
    }
    if (!utmMedium.trim() && suggestions.utmMedium) {
      setUtmMedium(suggestions.utmMedium);
    }
    if (!utmCampaign.trim() && resolvedSlug) {
      setUtmCampaign(resolvedSlug);
    }
  }

  function validateForm(): string | null {
    if (!title.trim()) return 'Informe o título da coleção.';
    if (!description.trim()) return 'Informe a descrição editorial.';
    if (!coverImageUrl.trim()) return 'Envie ou informe a URL da capa.';
    try {
      new URL(coverImageUrl.trim());
    } catch {
      return 'A URL da capa não é válida.';
    }
    if (!resolvedSlug) return 'Informe um slug válido.';
    if (!SLUG_PATTERN.test(resolvedSlug)) {
      return 'O slug deve conter apenas letras minúsculas, números e hífens.';
    }
    if (!ctaText.trim()) return 'Informe o texto do CTA.';
    if (productIds.length < 1) return 'Selecione pelo menos um produto.';
    return null;
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      adminToast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const utmDefaults: Record<string, string> = {};
      if (utmSource.trim()) utmDefaults['utm_source'] = utmSource.trim();
      if (utmMedium.trim()) utmDefaults['utm_medium'] = utmMedium.trim();
      if (utmCampaign.trim()) utmDefaults['utm_campaign'] = utmCampaign.trim();

      const body = {
        slug: resolvedSlug,
        title: title.trim(),
        description: description.trim(),
        coverImageUrl: coverImageUrl.trim(),
        campaignOrigin,
        utmDefaults,
        ctaText: ctaText.trim(),
        productIds,
      };

      const response = editing
        ? await fetch(`/api/admin/collections/${editing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/admin/collections', {
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
            : 'Falha ao salvar coleção';
        throw new Error(message);
      }

      adminToast.success(editing ? 'Coleção atualizada.' : 'Coleção criada.');
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar coleção');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="cms-props-sheet flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-[var(--admin-gray)] px-6 py-5">
          <SheetTitle>{editing ? 'Editar coleção' : 'Nova coleção'}</SheetTitle>
          <SheetDescription>
            Guia temático com produtos selecionados manualmente. A capa e o CTA aparecem no
            carrossel da home; a landing em /colecoes exibe título, descrição e produtos em ordem.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="px-6 py-8 text-center text-sm text-[var(--admin-text-muted)]">Carregando…</p>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <fieldset className="m-0 min-w-0 space-y-4 border-0 p-0">
                <legend className="text-sm font-semibold text-[var(--admin-navy)]">
                  Identificação
                </legend>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="collection-title">
                      Título <span className="text-[var(--admin-danger,#dc3545)]">*</span>
                    </Label>
                    <CollectionFieldHint text="Nome da coleção no carrossel da home e no cabeçalho da página /colecoes/...." />
                  </div>
                  <Input
                    id="collection-title"
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    placeholder="Setup gamer completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="collection-description">
                      Descrição editorial <span className="text-[var(--admin-danger,#dc3545)]">*</span>
                    </Label>
                    <CollectionFieldHint text="Texto editorial exibido no slide da home e na landing. Explique o tema da seleção." />
                  </div>
                  <Textarea
                    id="collection-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    placeholder="Explique por que esta seleção faz sentido para o visitante…"
                    required
                  />
                </div>

                {!showSlugField ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--admin-text-muted)]">
                    <span>
                      URL:{' '}
                      <code className="rounded bg-[var(--admin-accent-subtle)] px-1.5 py-0.5 font-mono">
                        /colecoes/{resolvedSlug || '…'}
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="collection-slug">Slug</Label>
                      <CollectionFieldHint text="URL em kebab-case. Evite alterar após divulgar em redes sociais." />
                    </div>
                    <Input
                      id="collection-slug"
                      value={slug}
                      onChange={(event) => {
                        slugTouched.current = true;
                        setSlug(event.target.value);
                      }}
                      placeholder="setup-gamer-completo"
                    />
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Página pública: /colecoes/{resolvedSlug || '…'}
                    </p>
                  </div>
                )}
              </fieldset>

              <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t border-[var(--admin-gray)] pt-6 p-0">
                <legend className="text-sm font-semibold text-[var(--admin-navy)]">Capa</legend>
                <CollectionCoverField
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  disabled={saving}
                />
              </fieldset>

              <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t border-[var(--admin-gray)] pt-6 p-0">
                <legend className="text-sm font-semibold text-[var(--admin-navy)]">
                  Campanha e rastreio
                </legend>

                <p className="rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                  Links de afiliado usam origem <strong className="text-[var(--admin-navy)]">coleção</strong>{' '}
                  e os parâmetros UTM na query de /go/....
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Origem da campanha</Label>
                    <CollectionFieldHint text="Canal principal da campanha social. Preenche UTMs sugeridas quando vazias." />
                  </div>
                  <Select value={campaignOrigin} onValueChange={handleCampaignOriginChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_ORIGINS.map((origin) => (
                        <SelectItem key={origin.value} value={origin.value}>
                          {origin.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="utm-source">Fonte UTM</Label>
                      <CollectionFieldHint text="Parâmetro utm_source anexado aos links /go/... para medir cliques por canal." />
                    </div>
                    <Input
                      id="utm-source"
                      value={utmSource}
                      onChange={(event) => setUtmSource(event.target.value)}
                      placeholder="pinterest"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="utm-medium">Meio UTM</Label>
                      <CollectionFieldHint text="Parâmetro utm_medium (ex.: social, email)." />
                    </div>
                    <Input
                      id="utm-medium"
                      value={utmMedium}
                      onChange={(event) => setUtmMedium(event.target.value)}
                      placeholder="social"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="utm-campaign">Campanha UTM</Label>
                      <CollectionFieldHint text="Parâmetro utm_campaign — use o slug ou nome da campanha." />
                    </div>
                    <Input
                      id="utm-campaign"
                      value={utmCampaign}
                      onChange={(event) => setUtmCampaign(event.target.value)}
                      placeholder="setup-gamer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="collection-cta">
                      Texto do CTA <span className="text-[var(--admin-danger,#dc3545)]">*</span>
                    </Label>
                    <CollectionFieldHint text="Texto do botão branco no slide da home (ex.: Ver coleção)." />
                  </div>
                  <Input
                    id="collection-cta"
                    value={ctaText}
                    onChange={(event) => setCtaText(event.target.value)}
                    placeholder="Ver coleção"
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="m-0 min-w-0 space-y-4 border-0 border-t border-[var(--admin-gray)] pt-6 p-0">
                <legend className="text-sm font-semibold text-[var(--admin-navy)]">Produtos</legend>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>
                      Produtos da coleção <span className="text-[var(--admin-danger,#dc3545)]">*</span>
                    </Label>
                    <CollectionFieldHint text="Ordem = narrativa do passo a passo na landing. Mínimo 1 produto." />
                  </div>
                  <ProductMultiSelect
                    products={products}
                    value={productIds}
                    onChange={setProductIds}
                  />
                </div>
              </fieldset>
            </div>

            <SheetFooter className="shrink-0 gap-2 border-t border-[var(--admin-gray)] px-6 py-4 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving || loading}>
                {saving ? 'Salvando…' : 'Salvar'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
