'use client';

import { useEffect, useState } from 'react';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { createAutoLinkClient, updateAutoLinkClient } from '@/lib/api/auto-links-client';
import { isManualTargetUrl } from '@/lib/internal-link-targets';
import type { AdminAutoLinkSummary, AutoLinkApplyToValue } from '@ecommerce-amazon/shared/admin';

import { AutoLinkFieldHint } from './AutoLinkListView';
import { InternalLinkTargetPicker } from './InternalLinkTargetPicker';

type AutoLinkFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: AdminAutoLinkSummary | null;
  onSaved: () => Promise<void>;
};

export function AutoLinkFormSheet({
  open,
  onOpenChange,
  editing,
  onSaved,
}: AutoLinkFormSheetProps): React.JSX.Element {
  const adminToast = useAdminToast();
  const [keyword, setKeyword] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [maxMatches, setMaxMatches] = useState('1');
  const [priority, setPriority] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [applyTo, setApplyTo] = useState<AutoLinkApplyToValue>('both');
  const [manualUrlMode, setManualUrlMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!editing) {
      setKeyword('');
      setTargetUrl('');
      setMaxMatches('1');
      setPriority('0');
      setIsActive(true);
      setApplyTo('both');
      setManualUrlMode(false);
      return;
    }

    setKeyword(editing.keyword);
    setTargetUrl(editing.targetUrl);
    setMaxMatches(String(editing.maxMatches));
    setPriority(String(editing.priority));
    setIsActive(editing.isActive);
    setApplyTo(editing.applyTo);
    setManualUrlMode(isManualTargetUrl(editing.targetUrl));
  }, [open, editing]);

  async function handleSave(): Promise<void> {
    const parsedMaxMatches = Number.parseInt(maxMatches, 10);
    const parsedPriority = Number.parseInt(priority, 10);

    if (!keyword.trim()) {
      adminToast.error('Informe a keyword.');
      return;
    }
    if (!targetUrl.trim()) {
      adminToast.error('Informe a URL de destino.');
      return;
    }
    if (!Number.isFinite(parsedMaxMatches) || parsedMaxMatches < 1) {
      adminToast.error('Máx. ocorrências deve ser pelo menos 1.');
      return;
    }
    if (!Number.isFinite(parsedPriority) || parsedPriority < 0) {
      adminToast.error('Prioridade deve ser zero ou maior.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        keyword: keyword.trim(),
        targetUrl: targetUrl.trim(),
        maxMatches: parsedMaxMatches,
        priority: parsedPriority,
        isActive,
        applyTo,
      };

      if (editing) {
        await updateAutoLinkClient(editing.id, payload);
        adminToast.success('Regra atualizada.');
      } else {
        await createAutoLinkClient(payload);
        adminToast.success('Regra criada.');
      }

      onOpenChange(false);
      await onSaved();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Falha ao salvar regra');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="auto-link-drawer cms-props-sheet flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="shrink-0 border-b border-[var(--admin-gray)] px-6 py-5">
          <SheetTitle>{editing ? 'Editar auto-link' : 'Nova auto-link'}</SheetTitle>
          <SheetDescription>
            Defina a keyword, o destino e onde injetar. Links de produto ou afiliado passam por /go
            na vitrine — o HTML no banco permanece intacto.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <CmsFormSection title="Keyword">
              <div className="space-y-2">
                <Label htmlFor="auto-link-keyword">Termo a linkar</Label>
                <Input
                  id="auto-link-keyword"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="ex: cadeira ergonômica"
                  required
                />
                <p className="text-xs leading-relaxed text-[var(--admin-text-muted)]">
                  Primeira ocorrência do termo vira link conforme as telas selecionadas abaixo.
                </p>
              </div>
            </CmsFormSection>

            <CmsFormSection title="Destino" className="cms-form-section-divider">
              <InternalLinkTargetPicker
                value={targetUrl}
                onChange={setTargetUrl}
                enabled={open}
                manualMode={manualUrlMode}
                onManualModeChange={setManualUrlMode}
              />
            </CmsFormSection>

            <CmsFormSection title="Onde exibir" className="cms-form-section-divider">
              <div className="space-y-2">
                <Label htmlFor="auto-link-apply-to">Telas</Label>
                <select
                  id="auto-link-apply-to"
                  value={applyTo}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === 'articles' || value === 'products' || value === 'both') {
                      setApplyTo(value);
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-[var(--admin-gray)] bg-white px-3 py-2 text-sm text-[var(--admin-navy)]"
                >
                  <option value="both">Artigos e produtos</option>
                  <option value="articles">Somente artigos</option>
                  <option value="products">Somente produtos</option>
                </select>
                <p className="text-xs text-[var(--admin-text-muted)]">
                  Controla em qual conteúdo editorial a keyword será linkada automaticamente.
                </p>
              </div>
            </CmsFormSection>

            <CmsFormSection title="Regras de injeção" className="cms-form-section-divider">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-link-priority">Prioridade</Label>
                    <AutoLinkFieldHint text="Maior valor = processada antes. Em empate, a keyword mais longa vence." />
                  </div>
                  <Input
                    id="auto-link-priority"
                    type="number"
                    min={0}
                    max={1000}
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="auto-link-max-matches">Máx. ocorrências</Label>
                    <AutoLinkFieldHint text="Limite de links por regra no mesmo texto. Não injeta dentro de links, títulos ou imagens existentes." />
                  </div>
                  <Input
                    id="auto-link-max-matches"
                    type="number"
                    min={1}
                    max={50}
                    value={maxMatches}
                    onChange={(event) => setMaxMatches(event.target.value)}
                  />
                </div>
              </div>
            </CmsFormSection>

            <div className="auto-link-drawer__toggle">
              <div>
                <p className="text-sm font-semibold text-[var(--admin-navy)]">Regra ativa</p>
                <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                  Regras inativas não aparecem na vitrine.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Regra ativa" />
            </div>
          </div>

          <SheetFooter className="shrink-0 flex-col gap-2 border-t border-[var(--admin-gray)] px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? 'Salvando…' : editing ? 'Guardar' : 'Criar'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
