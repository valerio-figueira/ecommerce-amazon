'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';

type CompareInsertModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductPickerOption[];
  onInsert: (slugs: string[]) => void;
};

const MIN_PRODUCTS = 2;
const MAX_PRODUCTS = 3;

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

export function CompareInsertModal({
  open,
  onOpenChange,
  products,
  onInsert,
}: CompareInsertModalProps): React.JSX.Element {
  const [filter, setFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query),
    );
  }, [filter, products]);

  function toggleProduct(productId: string): void {
    setSelectedIds((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }
      if (current.length >= MAX_PRODUCTS) {
        return current;
      }
      return [...current, productId];
    });
  }

  function handleConfirm(): void {
    const slugs = selectedIds
      .map((id) => products.find((product) => product.id === id)?.slug)
      .filter((slug): slug is string => Boolean(slug));
    if (slugs.length < MIN_PRODUCTS) return;
    onInsert(slugs);
    onOpenChange(false);
    setFilter('');
    setSelectedIds([]);
  }

  function handleOpenChange(nextOpen: boolean): void {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFilter('');
      setSelectedIds([]);
    }
  }

  const canConfirm =
    selectedIds.length >= MIN_PRODUCTS && selectedIds.length <= MAX_PRODUCTS;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inserir tabela comparativa</DialogTitle>
          <DialogDescription>
            Selecione de {MIN_PRODUCTS} a {MAX_PRODUCTS} produtos do catálogo local. O shortcode{' '}
            <code className="text-xs">[[compare:...]]</code> será inserido no cursor.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Buscar por nome ou slug…"
        />

        <p className="text-xs text-[var(--admin-text-muted)]">
          Selecionados: {selectedIds.length}/{MAX_PRODUCTS}
        </p>

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">Nenhum produto encontrado.</p>
          ) : (
            filtered.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const isDisabled = !isSelected && selectedIds.length >= MAX_PRODUCTS;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  disabled={isDisabled}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <span className="font-medium">{product.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">
                    {product.slug} · {marketplaceLabel(product.marketplace)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            Gerar shortcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
