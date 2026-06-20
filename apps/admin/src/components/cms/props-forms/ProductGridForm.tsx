'use client';

import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  ALL_CATEGORY_VALUE,
  getCategoryDisplayLabel,
} from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { PRODUCT_GRID_PAGE_SIZE_PRESETS } from '@/components/cms/props-forms/block-form-registry';
import { PresetChipPicker } from '@/components/cms/props-forms/PresetChipPicker';
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

type ProductGridFormProps = {
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function ProductGridForm({ control, categories }: ProductGridFormProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <CmsFormSection title="Texto da vitrine">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da seção</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ex: Produtos populares"
                />
              </FormControl>
              <FormDescription>
                Título editorial exibido acima da grade de produtos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Filtros" className="cms-form-section-divider">
        <FormField
          control={control}
          name="categorySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria inicial</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === ALL_CATEGORY_VALUE ? undefined : value)
                }
                value={readString(field.value) || ALL_CATEGORY_VALUE}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY_VALUE}>Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {getCategoryDisplayLabel(category.slug, category.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="marketplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marketplace</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === '__all__' ? undefined : value)}
                value={readString(field.value) || '__all__'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__all__">Amazon e Shopee</SelectItem>
                  <SelectItem value="amazon_br">Somente Amazon</SelectItem>
                  <SelectItem value="shopee_br">Somente Shopee</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="catalogHref"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link do catálogo completo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="/categorias/home-office"
                />
              </FormControl>
              <FormDescription>
                Destino do botão &quot;Ver catálogo completo&quot;. Se vazio, usa a categoria ativa
                ou `/categorias/home-office`.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Ordenação e layout" className="cms-form-section-divider">
        <FormField
          control={control}
          name="sort"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Como ordenar os produtos?</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={readString(field.value) || 'editorial_score'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="editorial_score">Melhor curadoria editorial</SelectItem>
                  <SelectItem value="price_updated_at">Preço atualizado recentemente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <PresetChipPicker
          control={control}
          name="pageSize"
          label="Quantidade de produtos"
          presets={PRODUCT_GRID_PAGE_SIZE_PRESETS}
          hint="Recomendado: 12 produtos para equilibrar velocidade e variedade."
        />

        <FormField
          control={control}
          name="columns"
          render={({ field }) => {
            const current = readNumber(field.value, 4);
            return (
              <FormItem>
                <FormLabel>Colunas no desktop</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    {[2, 4].map((columns) => (
                      <button
                        key={columns}
                        type="button"
                        onClick={() => field.onChange(columns)}
                        className={cn('cms-limit-chip', current === columns && 'is-active')}
                      >
                        {columns} colunas
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  Legado CMS — a home exibe carrossel horizontal; este campo não altera o layout
                  público.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CmsFormSection>
    </div>
  );
}
