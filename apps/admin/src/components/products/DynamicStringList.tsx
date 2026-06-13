'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/product-form-values';

type DynamicStringListProps = {
  name: 'pros' | 'cons';
  addLabel: string;
  placeholder: string;
};

export function DynamicStringList({
  name,
  addLabel,
  placeholder,
}: DynamicStringListProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const items = form.watch(name) ?? [];

  const updateAt = (index: number, value: string): void => {
    const next = [...items];
    next[index] = value;
    form.setValue(name, next, { shouldDirty: true });
  };

  const appendItem = (): void => {
    form.setValue(name, [...items, ''], { shouldDirty: true });
  };

  const removeAt = (index: number): void => {
    form.setValue(
      name,
      items.filter((_, itemIndex) => itemIndex !== index),
      { shouldDirty: true },
    );
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${name}-${index}`} className="flex items-center gap-2">
          <Input
            placeholder={placeholder}
            value={item}
            onChange={(event) => updateAt(index, event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeAt(index)}
            aria-label="Remover item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={appendItem}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
