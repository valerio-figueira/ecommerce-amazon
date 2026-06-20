'use client';

import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';

type ProductIdPickerProps = {
  products: ProductPickerOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

function marketplaceLabel(marketplace: string): string {
  if (marketplace === 'amazon_br') return 'Amazon';
  if (marketplace === 'shopee_br') return 'Shopee';
  return marketplace;
}

export function ProductIdPicker({
  products,
  value,
  onChange,
  placeholder = 'Escolha um produto',
}: ProductIdPickerProps): React.JSX.Element {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) || product.slug.toLowerCase().includes(query),
    );
  }, [filter, products]);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Buscar por nome ou slug…"
        className="text-sm"
      />
      <Select {...(value !== '' ? { value } : {})} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filtered.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              Nenhum produto encontrado
            </SelectItem>
          ) : (
            filtered.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.title} · {marketplaceLabel(product.marketplace)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
