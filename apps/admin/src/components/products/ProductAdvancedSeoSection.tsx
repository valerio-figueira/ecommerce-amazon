'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/product-form-values';
import {
  buildProductMetaDescription,
  buildProductMetaTitle,
} from '@ecommerce-amazon/shared/seo';

export function ProductAdvancedSeoSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const titleClean = useWatch({ control: form.control, name: 'titleClean' }) ?? '';
  const autoTitle = titleClean.trim().length > 0 ? buildProductMetaTitle(titleClean) : '—';
  const autoDescription =
    titleClean.trim().length > 0 ? buildProductMetaDescription(titleClean) : '—';

  return (
    <CmsFormSection title="SEO avançado (opcional)">
      <p className="rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] px-4 py-3 text-xs text-[var(--admin-text-muted)]">
        Estes campos são gerados automaticamente pelo sistema na vitrine. Preencha apenas se quiser
        ignorar a automação padrão.
      </p>

      <div className="space-y-2 rounded-lg border border-dashed border-[var(--admin-gray)] px-4 py-3 text-xs text-[var(--admin-text-muted)]">
        <p>
          <strong className="text-[var(--admin-navy)]">Automático — Meta Title:</strong> {autoTitle}
        </p>
        <p>
          <strong className="text-[var(--admin-navy)]">Automático — Meta Description:</strong>{' '}
          {autoDescription}
        </p>
      </div>

      <FormField
        control={form.control}
        name="metaTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Title (sobrescrita)</FormLabel>
            <FormControl>
              <Input
                placeholder="Deixe vazio para usar o título automático"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta Description (sobrescrita)</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Deixe vazio para usar a descrição automática"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>Máximo recomendado: 160 caracteres para resultados de busca.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
