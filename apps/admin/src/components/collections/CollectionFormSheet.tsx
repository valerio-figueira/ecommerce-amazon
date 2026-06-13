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

export function CollectionFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: CollectionFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const slugTouched = useRef(false);
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

  useEffect(() => {
    if (!open) return;
    void listProductsClient({ pageSize: 100 }).then(setProducts);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    slugTouched.current = false;

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

  async function handleSubmit(): Promise<void> {
    setSaving(true);
    try {
      const utmDefaults: Record<string, string> = {};
      if (utmSource.trim()) utmDefaults['utm_source'] = utmSource.trim();
      if (utmMedium.trim()) utmDefaults['utm_medium'] = utmMedium.trim();
      if (utmCampaign.trim()) utmDefaults['utm_campaign'] = utmCampaign.trim();

      const body = {
        slug,
        title,
        description,
        coverImageUrl,
        campaignOrigin,
        utmDefaults,
        ctaText,
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{editing ? 'Editar coleção' : 'Nova coleção'}</SheetTitle>
          <SheetDescription>
            Guia temático com produtos selecionados manualmente. A ordem define a narrativa do
            passo a passo na vitrine.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="py-8 text-center text-sm text-[var(--admin-text-muted)]">Carregando…</p>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-title">Título</Label>
              <Input
                id="collection-title"
                value={title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Setup gamer completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-slug">Slug (URL)</Label>
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
                Página pública: /colecoes/{slug || '…'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-description">Descrição editorial</Label>
              <Textarea
                id="collection-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                placeholder="Explique por que esta seleção faz sentido para o visitante…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-cover">URL da capa</Label>
              <Input
                id="collection-cover"
                value={coverImageUrl}
                onChange={(event) => setCoverImageUrl(event.target.value)}
                placeholder="https://…"
              />
            </div>

            <div className="space-y-2">
              <Label>Origem da campanha</Label>
              <Select value={campaignOrigin} onValueChange={setCampaignOrigin}>
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
                <Label htmlFor="utm-source">UTM source</Label>
                <Input
                  id="utm-source"
                  value={utmSource}
                  onChange={(event) => setUtmSource(event.target.value)}
                  placeholder="pinterest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm-medium">UTM medium</Label>
                <Input
                  id="utm-medium"
                  value={utmMedium}
                  onChange={(event) => setUtmMedium(event.target.value)}
                  placeholder="social"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="utm-campaign">UTM campaign</Label>
                <Input
                  id="utm-campaign"
                  value={utmCampaign}
                  onChange={(event) => setUtmCampaign(event.target.value)}
                  placeholder="setup-gamer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection-cta">Texto do CTA</Label>
              <Input
                id="collection-cta"
                value={ctaText}
                onChange={(event) => setCtaText(event.target.value)}
                placeholder="Ver coleção"
              />
            </div>

            <div className="space-y-2">
              <Label>Produtos da coleção</Label>
              <ProductMultiSelect products={products} value={productIds} onChange={setProductIds} />
            </div>
          </div>
        )}

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving || loading}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
