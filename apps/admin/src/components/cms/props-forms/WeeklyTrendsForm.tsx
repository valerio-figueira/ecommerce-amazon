'use client';

import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
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
import { Switch } from '@/components/ui/switch';

type WeeklyTrendsFormProps = {
  control: Control<BlockFormValues>;
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

const MIN_ITEMS_PRESETS = [1, 2, 3, 4] as const;

export function WeeklyTrendsForm({ control }: WeeklyTrendsFormProps): React.JSX.Element {
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
                  placeholder="Tendências da semana"
                />
              </FormControl>
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
                  placeholder="Baseado na atividade dos últimos 7 dias"
                />
              </FormControl>
              <FormDescription>
                Se vazio, a vitrine usa o texto padrão com o período de 7 dias.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Comportamento" className="cms-form-section-divider">
        <FormField
          control={control}
          name="defaultTab"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aba exibida por padrão</FormLabel>
              <Select onValueChange={field.onChange} value={readString(field.value) || 'products'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="articles">Artigos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="showTabToggle"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] p-4">
              <div className="space-y-1">
                <FormLabel>Permitir alternar entre Produtos e Artigos</FormLabel>
                <FormDescription>
                  Visitantes podem trocar a aba quando houver dados suficientes nas duas.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={readBoolean(field.value, true)}
                  onCheckedChange={field.onChange}
                  aria-label="Mostrar alternância de abas"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Ranking automático" className="cms-form-section-divider">
        <p className="text-sm text-[var(--admin-text-muted)]">
          Produtos: cliques afiliados nos últimos 7 dias. Artigos: leituras (page views) nos
          últimos 7 dias. O bloco só aparece na vitrine quando houver dados suficientes.
        </p>

        <ProductLimitPicker control={control} />

        <FormField
          control={control}
          name="minItems"
          render={({ field }) => {
            const current = readNumber(field.value, 3);
            return (
              <FormItem>
                <FormLabel>Mínimo de itens para exibir</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {MIN_ITEMS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => field.onChange(preset)}
                        className={`cms-limit-chip${current === preset ? ' is-active' : ''}`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  Se uma aba tiver menos itens que o mínimo, ela fica oculta na vitrine.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CmsFormSection>

      <CmsFormSection title="Links de rodapé (opcional)" className="cms-form-section-divider">
        <FormField
          control={control}
          name="productsCtaHref"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link — aba Produtos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="/categorias"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="productsCtaLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do link — Produtos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ver catálogo completo ➔"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="articlesCtaHref"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link — aba Artigos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="/artigos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="articlesCtaLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do link — Artigos</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={readString(field.value)}
                  placeholder="Ver todos os artigos ➔"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>
    </div>
  );
}
