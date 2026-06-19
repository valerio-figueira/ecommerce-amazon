'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import type { SpecPropertyRowState } from '@/lib/product-specs-form-state';

type ProductSpecPropertyRowProps = {
  row: SpecPropertyRowState;
  onChange: (rowId: string, key: string, value: string) => void;
  onBlur: () => void;
  onRemove: (rowId: string) => void;
};

export function ProductSpecPropertyRow({
  row,
  onChange,
  onBlur,
  onRemove,
}: ProductSpecPropertyRowProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        aria-label="Chave do atributo"
        placeholder="Ex: Peso do item"
        value={row.key}
        onChange={(event) => onChange(row.id, event.target.value, row.value)}
        onBlur={onBlur}
        className="sm:flex-1"
      />
      <Textarea
        aria-label="Valor do atributo"
        placeholder="Ex: 4 Quilogramas"
        value={row.value}
        onChange={(event) => onChange(row.id, row.key, event.target.value)}
        onBlur={onBlur}
        className="min-h-[72px] sm:flex-[2]"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onRemove(row.id)}
        aria-label="Remover atributo"
        className="sm:mt-1"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
