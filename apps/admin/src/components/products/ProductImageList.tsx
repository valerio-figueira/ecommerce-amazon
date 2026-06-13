'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { z } from 'zod';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

type ProductFormValues = z.input<typeof createProductBodySchema>;

type ProductImageListProps = {
  name: 'images';
};

export function ProductImageList({ name }: ProductImageListProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const images = form.watch(name) ?? [];

  const updateAt = (index: number, value: string): void => {
    const next = [...images];
    next[index] = value;
    form.setValue(name, next, { shouldDirty: true });
  };

  const appendImage = (): void => {
    form.setValue(name, [...images, ''], { shouldDirty: true });
  };

  const removeAt = (index: number): void => {
    form.setValue(
      name,
      images.filter((_, itemIndex) => itemIndex !== index),
      { shouldDirty: true },
    );
  };

  const move = (from: number, to: number): void => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    if (item === undefined) return;
    next.splice(to, 0, item);
    form.setValue(name, next, { shouldDirty: true });
  };

  return (
    <div className="space-y-2">
      {images.length === 0 ? (
        <p className="text-xs text-[var(--admin-text-muted)]">
          Nenhuma imagem adicionada. Cole URLs HTTPS de imagens do produto.
        </p>
      ) : (
        images.map((imageUrl, index) => (
          <div key={`${name}-${index}`} className="flex items-center gap-2">
            <Input
              placeholder="https://..."
              value={imageUrl}
              onChange={(event) => updateAt(index, event.target.value)}
            />
            <div className="flex shrink-0 gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                aria-label="Mover para cima"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={index === images.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Mover para baixo"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAt(index)}
                aria-label="Remover imagem"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={appendImage}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Adicionar imagem
      </Button>
    </div>
  );
}
