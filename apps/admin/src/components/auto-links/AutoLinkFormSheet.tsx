'use client';

import { useEffect, useState } from 'react';

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
import {
  createAutoLinkClient,
  updateAutoLinkClient,
} from '@/lib/api/auto-links-client';
import type { AdminAutoLinkSummary } from '@ecommerce-amazon/shared/admin';

import { AutoLinkFieldHint } from './AutoLinkListView';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (!editing) {
      setKeyword('');
      setTargetUrl('');
      setMaxMatches('1');
      setPriority('0');
      setIsActive(true);
      return;
    }

    setKeyword(editing.keyword);
    setTargetUrl(editing.targetUrl);
    setMaxMatches(String(editing.maxMatches));
    setPriority(String(editing.priority));
    setIsActive(editing.isActive);
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
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? 'Editar auto-link' : 'Nova auto-link'}</SheetTitle>
          <SheetDescription>
            A keyword será linkada automaticamente na vitrine. O HTML do artigo no banco não é
            alterado.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auto-link-keyword">Keyword</Label>
            <Input
              id="auto-link-keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="ex: cadeira ergonômica"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-link-target-url">URL de destino</Label>
            </div>
            <Input
              id="auto-link-target-url"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="/produtos/slug ou https://..."
              required
            />
            <p className="text-xs text-[var(--admin-text-muted)]">
              Use caminho interno (ex.: /categorias/home-office) ou URL HTTPS absoluta.
            </p>
          </div>

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
              <Label htmlFor="auto-link-max-matches">Máx. ocorrências por artigo</Label>
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

          <div className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] px-3 py-2">
            <div>
              <p className="text-sm font-medium text-[var(--admin-navy)]">Regra ativa</p>
              <p className="text-xs text-[var(--admin-text-muted)]">
                Regras inativas não aparecem na vitrine.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Regra ativa" />
          </div>
        </div>

        <SheetFooter className="mt-6">
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
      </SheetContent>
    </Sheet>
  );
}
