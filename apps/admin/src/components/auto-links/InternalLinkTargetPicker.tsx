'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useInternalLinkTargetSearch } from '@/lib/hooks/useInternalLinkTargets';
import {
  findInternalLinkTargetByUrl,
  getInternalLinkTypeLabel,
  groupInternalLinkTargets,
  isManualTargetUrl,
} from '@/lib/internal-link-targets';
import { cn } from '@/lib/utils';

type InternalLinkTargetPickerProps = {
  value: string;
  onChange: (url: string) => void;
  enabled: boolean;
  manualMode: boolean;
  onManualModeChange: (manual: boolean) => void;
};

export function InternalLinkTargetPicker({
  value,
  onChange,
  enabled,
  manualMode,
  onManualModeChange,
}: InternalLinkTargetPickerProps): React.JSX.Element {
  const [panelOpen, setPanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { targets, loading, error, search, setSearch, requiresMinSearchLength, productLimit } =
    useInternalLinkTargetSearch({
      enabled: enabled && !manualMode,
      selectedUrl: value,
    });

  const selectedTarget = useMemo(
    () => findInternalLinkTargetByUrl(value, targets),
    [targets, value],
  );

  const groupedTargets = useMemo(() => groupInternalLinkTargets(targets), [targets]);
  const firstTarget = targets[0] ?? null;
  const trimmedSearch = search.trim();
  const awaitingMinSearch =
    trimmedSearch.length > 0 && trimmedSearch.length < requiresMinSearchLength;

  useEffect(() => {
    if (!enabled || manualMode) {
      setPanelOpen(false);
    }
  }, [enabled, manualMode]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      const target = event.target;
      if (
        target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function handleSelect(targetUrl: string, label: string): void {
    onChange(targetUrl);
    setSearch(label);
    setPanelOpen(false);
  }

  function handleClearSelection(): void {
    onChange('');
    setSearch('');
    setPanelOpen(true);
  }

  function handleSearchChange(nextQuery: string): void {
    setSearch(nextQuery);
    setPanelOpen(true);
    if (value.length > 0 && selectedTarget && nextQuery !== selectedTarget.label) {
      onChange('');
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter' && firstTarget) {
      event.preventDefault();
      handleSelect(firstTarget.targetUrl, firstTarget.label);
    }
    if (event.key === 'Escape') {
      setPanelOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="auto-link-picker">
      {manualMode ? (
        <div className="space-y-2">
          <Label htmlFor="auto-link-target-url-manual">URL manual</Label>
          <Input
            id="auto-link-target-url-manual"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://www.amazon.com.br/... ou /caminho/custom"
            required
          />
          <p className="auto-link-picker__hint">
            Cole links de afiliado HTTPS (Amazon, Mercado Livre, Shopee) ou caminhos internos
            começando com /.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedTarget ? (
            <div className="auto-link-picker__selected">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="auto-link-picker__selected-title">{selectedTarget.label}</p>
                  <span className="auto-link-type-pill">
                    {getInternalLinkTypeLabel(selectedTarget.type)}
                  </span>
                </div>
                <p className="auto-link-picker__selected-url">{selectedTarget.targetUrl}</p>
              </div>
              <button
                type="button"
                className="auto-link-picker__clear"
                aria-label="Limpar destino selecionado"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : value.trim().length > 0 && !isManualTargetUrl(value) ? (
            <div className="rounded-[10px] border border-dashed border-[var(--admin-gray)] bg-[var(--admin-surface)] px-3 py-2 text-xs text-[var(--admin-text-muted)]">
              URL atual: <span className="font-mono text-[var(--admin-navy)]">{value}</span>
            </div>
          ) : null}

          <div className="auto-link-picker__search-wrap">
            <Search className="auto-link-picker__search-icon" aria-hidden />
            <Input
              id="auto-link-target-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => setPanelOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar produto, categoria, coleção ou artigo…"
              className="auto-link-picker__search-input"
              aria-expanded={panelOpen}
              aria-controls="auto-link-target-panel"
              autoComplete="off"
            />
            {loading ? (
              <Loader2
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--admin-text-muted)]"
                aria-hidden
              />
            ) : null}
          </div>

          <p
            className={cn(
              'auto-link-picker__hint',
              awaitingMinSearch && 'auto-link-picker__hint--warn',
            )}
          >
            {awaitingMinSearch
              ? `Digite ao menos ${requiresMinSearchLength} caracteres para buscar produtos e artigos.`
              : `Categorias e coleções listadas ao abrir; produtos e artigos limitados a ${productLimit} por busca.`}
          </p>

          {error ? <p className="auto-link-picker__error">{error}</p> : null}

          {panelOpen ? (
            <div id="auto-link-target-panel" role="listbox" className="auto-link-picker__panel">
              {loading && groupedTargets.length === 0 ? (
                <p className="auto-link-picker__empty">Buscando destinos…</p>
              ) : groupedTargets.length === 0 ? (
                <p className="auto-link-picker__empty">
                  {awaitingMinSearch
                    ? 'Continue digitando para ver produtos e artigos.'
                    : 'Nenhum destino encontrado.'}
                </p>
              ) : (
                groupedTargets.map((group) => (
                  <div key={group.type}>
                    <p className="auto-link-picker__group-label">{group.groupLabel}</p>
                    <ul className="m-0 list-none p-0">
                      {group.items.map((target) => (
                        <li key={`${target.type}-${target.slug}`}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={value === target.targetUrl}
                            className={cn(
                              'auto-link-picker__option',
                              value === target.targetUrl && 'is-selected',
                            )}
                            onClick={() => handleSelect(target.targetUrl, target.label)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="auto-link-picker__option-label">{target.label}</span>
                              <span className="auto-link-picker__option-meta">
                                {target.slug}
                                {target.meta ? ` · ${target.meta}` : ''}
                              </span>
                            </span>
                            <span className="auto-link-type-pill">
                              {getInternalLinkTypeLabel(target.type)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}

      <div className="auto-link-picker__manual-row">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--admin-navy)]">URL manual</p>
          <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
            Link externo, afiliado ou caminho customizado.
          </p>
        </div>
        <Switch
          checked={manualMode}
          onCheckedChange={onManualModeChange}
          aria-label="Usar URL manual"
        />
      </div>
    </div>
  );
}
