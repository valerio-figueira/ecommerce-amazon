'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminToast } from '@/components/ui/admin-toast';
import { updateSiteSettingsClient } from '@/lib/api/site-settings-client';
import { DEFAULT_SITE_SETTINGS, type SiteSettingsResponse } from '@ecommerce-amazon/shared/admin';

function mergeSettingsWithDefaults(settings: SiteSettingsResponse): SiteSettingsResponse {
  return {
    ...settings,
    features: { ...DEFAULT_SITE_SETTINGS.features, ...settings.features },
    seo: { ...DEFAULT_SITE_SETTINGS.seo, ...settings.seo },
    cms: { ...DEFAULT_SITE_SETTINGS.cms, ...settings.cms },
  };
}

type SiteSettingsPanelProps = {
  initialSettings: SiteSettingsResponse;
  canManage: boolean;
};

export function SiteSettingsPanel({
  initialSettings,
  canManage,
}: SiteSettingsPanelProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [settings, setSettings] = useState(() => mergeSettingsWithDefaults(initialSettings));
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<void> {
    if (!canManage) return;
    setSaving(true);
    try {
      const saved = await updateSiteSettingsClient({
        features: settings.features,
        seo: settings.seo,
        cms: settings.cms,
      });
      setSettings(saved);
      adminToast.success('Preferências salvas.');
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar preferências');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="cms-float-panel cms-vitrine-panel">
        <div className="cms-panel-head">
          <h2 className="cms-panel-title">
            <SlidersHorizontal className="mr-2 inline h-4 w-4" />
            Preferências CMS e plataforma
          </h2>
          <p className="cms-panel-meta">
            <strong>Feature flags operacionais</strong>
            <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
              Controla retenção, SEO e comportamento do editor CMS.
            </span>
          </p>
        </div>
        {canManage ? (
          <div className="cms-panel-actions">
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar preferências'}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="cms-float-panel cms-blocks-panel">
        <div className="space-y-5">
          <SettingRow
            label="Exibir preços na vitrine"
            description="Oculta valores numéricos em toda a vitrine pública; CTAs de afiliado permanecem ativos."
            checked={settings.features.pricesEnabled}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                features: { ...current.features, pricesEnabled: checked },
              }))
            }
          />
          <SettingRow
            label="Alertas de preço por e-mail"
            description="Permite disparo de alertas pelo worker quando o preço atinge o alvo."
            checked={settings.features.priceAlertsEnabled}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                features: { ...current.features, priceAlertsEnabled: checked },
              }))
            }
          />
          <SettingRow
            label="Batch checkout na wishlist"
            description="Habilita redirecionamento em lote para o marketplace."
            checked={settings.features.batchCheckoutEnabled}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                features: { ...current.features, batchCheckoutEnabled: checked },
              }))
            }
          />
          <SettingRow
            label="Indexação pública (SEO)"
            description="Master switch para permitir indexação do site nos buscadores."
            checked={settings.features.publicIndexingEnabled}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                features: { ...current.features, publicIndexingEnabled: checked },
              }))
            }
          />
          <SettingRow
            label="Respeitar gate de afiliado no SEO"
            description="Bloqueia indexação enquanto houver conta pending_manual_validation."
            checked={settings.seo.respectAffiliateGate}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                seo: { ...current.seo, respectAffiliateGate: checked },
              }))
            }
          />
          <SettingRow
            label="Confirmar antes de salvar blocos CMS"
            description="Exige confirmação no editor de blocos da home."
            checked={settings.cms.publishConfirmRequired}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                cms: { ...current.cms, publishConfirmRequired: checked },
              }))
            }
          />
          <div className="space-y-2">
            <Label>Visibilidade padrão de novos blocos</Label>
            <Select
              value={settings.cms.defaultBlockVisibility}
              disabled={!canManage}
              onValueChange={(value: 'all' | 'desktop' | 'mobile') =>
                setSettings((current) => ({
                  ...current,
                  cms: { ...current.cms, defaultBlockVisibility: value },
                }))
              }
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os dispositivos</SelectItem>
                <SelectItem value="desktop">Somente desktop</SelectItem>
                <SelectItem value="mobile">Somente mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}

type SettingRowProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function SettingRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: SettingRowProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] pb-4 last:border-b-0">
      <div>
        <p className="font-medium text-[var(--admin-text)]">{label}</p>
        <p className="text-sm text-[var(--admin-text-muted)]">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
