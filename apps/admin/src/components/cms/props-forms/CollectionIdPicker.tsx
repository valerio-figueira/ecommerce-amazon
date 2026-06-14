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
import type { AdminCollectionPickerOption } from '@/lib/api/cms-pages-client';

type CollectionIdPickerProps = {
  collections: AdminCollectionPickerOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
};

export function CollectionIdPicker({
  collections,
  value,
  onChange,
  placeholder = 'Escolha uma coleção',
}: CollectionIdPickerProps): React.JSX.Element {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter(
      (collection) =>
        collection.title.toLowerCase().includes(query) ||
        collection.slug.toLowerCase().includes(query),
    );
  }, [collections, filter]);

  return (
    <div className="space-y-2">
      <Input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Buscar por título ou slug…"
        className="text-sm"
      />
      <Select {...(value !== '' ? { value } : {})} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filtered.length === 0 ? (
            <SelectItem value="__empty__" disabled>
              Nenhuma coleção encontrada
            </SelectItem>
          ) : (
            filtered.map((collection) => (
              <SelectItem key={collection.id} value={collection.id}>
                {collection.title}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
