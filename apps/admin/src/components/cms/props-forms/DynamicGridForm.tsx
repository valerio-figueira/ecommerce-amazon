'use client';

import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  ALL_CATEGORY_VALUE,
  getCategoryDisplayLabel,
  getDiscountLabel,
  getSortByOptions,
} from '@/components/cms/props-forms/dynamic-grid-form-meta';
import { ProductLimitPicker } from '@/components/cms/props-forms/ProductLimitPicker';
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
import { Slider } from '@/components/ui/slider';

type CategoryOption = { slug: string; label: string };

type DynamicGridFormProps = {
  control: Control<BlockFormValues>;
  categories: CategoryOption[];
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function DynamicGridForm({
  control,
  categories,
}: DynamicGridFormProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <CmsFormSection title="Texto da vitrine">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título principal</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ex: Melhores Cadeiras Ergonômicas"
                />
              </FormControl>
              <FormDescription>
                Ex: &quot;Cadeiras Gamer que Vale a Pena Comprar&quot; ou &quot;Ofertas da
                Semana&quot;.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ex: Escolhas da nossa equipe testadas este mês"
                />
              </FormControl>
              <FormDescription>
                Uma frase curta para dar mais contexto abaixo do título.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Regras de seleção automática" className="cms-form-section-divider">
        <FormField
          control={control}
          name="categoryVertical"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual categoria exibir?</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === ALL_CATEGORY_VALUE ? undefined : value)
                }
                value={readString(field.value) || ALL_CATEGORY_VALUE}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os produtos do site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY_VALUE}>
                    ✨ Todos os produtos do site
                  </SelectItem>
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
          name="minDiscountPercentage"
          render={({ field }) => {
            const discount = readNumber(field.value, 0);
            return (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>Filtrar por desconto?</FormLabel>
                  <span className="cms-discount-badge">{getDiscountLabel(discount)}</span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={70}
                    step={5}
                    value={[discount]}
                    onValueChange={(values) => {
                      const next = values[0] ?? 0;
                      field.onChange(next === 0 ? undefined : next);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Exibir apenas produtos com mais de {discount}% de desconto. Em 0%, qualquer
                  preço entra na vitrine.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="sortBy"
          render={({ field }) => {
            const current = readString(field.value) || 'editorial_score';
            const options = getSortByOptions(current);
            return (
              <FormItem>
                <FormLabel>Quem aparece primeiro? (Ordenação)</FormLabel>
                <Select onValueChange={field.onChange} value={current}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CmsFormSection>

      <CmsFormSection title="Layout e limites" className="cms-form-section-divider">
        <ProductLimitPicker control={control} />
      </CmsFormSection>
    </div>
  );
}
