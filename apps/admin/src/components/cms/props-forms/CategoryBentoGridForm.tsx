'use client';

import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch, type Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  ALL_CATEGORY_VALUE,
  type CategoryBentoTileFormValue,
  getBentoTileActionMode,
} from '@/components/cms/props-forms/block-form-registry';
import { getCategoryDisplayLabel } from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CategoryOption = { slug: string; label: string };

type CategoryBentoGridFormProps = {
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

const DEFAULT_TILE: CategoryBentoTileFormValue = {
  title: 'Nova categoria',
  subtitle: '',
  imageUrl: 'https://placehold.co/400x400?text=Categoria',
  size: 'small',
  actionMode: 'none',
};

function readTileList(value: unknown): CategoryBentoTileFormValue[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CategoryBentoTileFormValue => typeof item === 'object' && item !== null);
}

type BentoTileCardProps = {
  index: number;
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
  previewTitle: string;
  canRemove: boolean;
  onRemove: () => void;
};

function BentoTileCard({
  index,
  control,
  categories,
  previewTitle,
  canRemove,
  onRemove,
}: BentoTileCardProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const watchedTile = useWatch({ control, name: `tiles.${index}` });
  const actionMode = getBentoTileActionMode(watchedTile);

  return (
    <div className={cn('cms-slide-card', !isOpen && 'is-collapsed')}>
      <div className="cms-slide-card-header">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--admin-navy-deep)]">Card {index + 1}</p>
          {!isOpen && previewTitle && (
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{previewTitle}</p>
          )}
        </div>
        <div className="cms-slide-card-actions">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cms-slide-card-toggle"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Ocultar card ${index + 1}` : `Mostrar card ${index + 1}`}
            title={isOpen ? 'Ocultar' : 'Mostrar'}
          >
            {isOpen ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remover
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3">
          <FormField
            control={control}
            name={`tiles.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input {...field} value={readString(field.value)} placeholder="Ex: Home office" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tiles.${index}.subtitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} value={readString(field.value)} placeholder="Ex: 25k itens" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tiles.${index}.imageUrl`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem</FormLabel>
                <FormControl>
                  <Input {...field} value={readString(field.value)} placeholder="https://…" />
                </FormControl>
                <FormDescription>Cole o link da foto do produto ou categoria.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tiles.${index}.size`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho no grid</FormLabel>
                <Select onValueChange={field.onChange} value={readString(field.value) || 'small'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="small">Pequeno — 1 coluna</SelectItem>
                    <SelectItem value="large">Grande — 2 colunas</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Cards grandes ocupam o dobro da largura, como no layout bento.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tiles.${index}.actionMode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ao clicar no card</FormLabel>
                <Select onValueChange={field.onChange} value={readString(field.value) || 'none'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma ação</SelectItem>
                    <SelectItem value="category">Filtrar produtos por categoria</SelectItem>
                    <SelectItem value="link">Abrir link</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {actionMode === 'category' && (
            <FormField
              control={control}
              name={`tiles.${index}.categorySlug`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={readString(field.value) || ALL_CATEGORY_VALUE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {getCategoryDisplayLabel(category.slug, category.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Filtra grades de produtos na mesma página que usam filtro de categoria.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {actionMode === 'link' && (
            <FormField
              control={control}
              name={`tiles.${index}.href`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={readString(field.value)}
                      placeholder="/colecoes/setup-gamer ou https://…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function CategoryBentoGridForm({
  control,
  categories,
}: CategoryBentoGridFormProps): React.JSX.Element {
  const { setValue } = useFormContext<BlockFormValues>();
  const watchedTiles = useWatch({ control, name: 'tiles' });
  const tileList = readTileList(watchedTiles);

  function appendTile(): void {
    setValue('tiles', [...tileList, DEFAULT_TILE], { shouldDirty: true });
  }

  function removeTile(index: number): void {
    setValue(
      'tiles',
      tileList.filter((_, tileIndex) => tileIndex !== index),
      { shouldDirty: true },
    );
  }

  return (
    <div className="space-y-6">
      <CmsFormSection title="Texto da seção">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ex: Categorias populares"
                />
              </FormControl>
              <FormDescription>Aparece acima da grade de cards na vitrine.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Cards da grade" className="cms-form-section-divider">
        <div className="space-y-4">
          {tileList.map((tile, index) => (
            <BentoTileCard
              key={`bento-tile-${index}`}
              index={index}
              control={control}
              categories={categories}
              previewTitle={readString(tile['title'])}
              canRemove={tileList.length > 1}
              onRemove={() => removeTile(index)}
            />
          ))}
        </div>

        {tileList.length < 8 && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={appendTile}>
            <Plus className="h-4 w-4" />
            Adicionar card
          </Button>
        )}

        <p className="mt-3 text-xs text-[var(--admin-text-muted)]">
          Use cards grandes e pequenos alternados para o efeito bento (até 8 cards).
        </p>
      </CmsFormSection>
    </div>
  );
}
