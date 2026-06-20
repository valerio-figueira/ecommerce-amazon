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

type ProductSearchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductPickerOption[];
  onSelect: (product: ProductPickerOption) => void;
};

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  if (marketplace === 'mercadolivre_br') return 'Mercado Livre';
  return marketplace;
}

export function ProductSearchModal({
  open,
  onOpenChange,
  products,
  onSelect,
}: ProductSearchModalProps): React.JSX.Element {
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query),
    );
  }, [filter, products]);

  function handleConfirm(): void {
    const product = products.find((item) => item.id === selectedId);
    if (!product) return;
    onSelect(product);
    onOpenChange(false);
    setFilter('');
    setSelectedId('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Inserir produto no artigo</DialogTitle>
          <DialogDescription>
            Busque no catálogo local e insira um card de afiliado no conteúdo.
          </DialogDescription>
        </DialogHeader>

        <Input
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Buscar por nome ou slug…"
        />

        <div className="max-h-64 space-y-2 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">Nenhum produto encontrado.</p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedId(product.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selectedId === product.id
                    ? 'border-[var(--admin-primary)] bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <span className="font-medium">{product.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">
                  {product.slug} · {marketplaceLabel(product.marketplace)}
                </span>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={selectedId === ''}>
            Inserir card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
