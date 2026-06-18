'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { ProductFormLabelRow } from '@/components/products/ProductFormLabelRow';
import { ProductSeoLlmPromptHelper } from '@/components/products/ProductSeoLlmPromptHelper';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, Textarea } from '@/components/ui/input';
import {
  PRODUCT_FORM_HINTS,
  PRODUCT_META_DESCRIPTION_MAX,
  PRODUCT_META_TITLE_MAX,
  PRODUCT_SEO_DESCRIPTION_GOOGLE_LIMIT,
  PRODUCT_SEO_TITLE_GOOGLE_LIMIT,
} from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';
import {
  buildProductMetaDescription,
  buildProductMetaTitle,
} from '@ecommerce-amazon/shared/seo';

export function ProductAdvancedSeoSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const titleClean = useWatch({ control: form.control, name: 'titleClean' }) ?? '';
  const metaTitle = useWatch({ control: form.control, name: 'metaTitle' }) ?? '';
  const metaDescription = useWatch({ control: form.control, name: 'metaDescription' }) ?? '';
  const autoTitle = titleClean.trim().length > 0 ? buildProductMetaTitle(titleClean) : '—';
  const autoDescription =
    titleClean.trim().length > 0 ? buildProductMetaDescription(titleClean) : '—';

  return (
    <CmsFormSection title="SEO avançado (opcional)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--admin-text-muted)]">
          Sobrescreva o automático só quando necessário. Use o assistente para sugestões alinhadas ao
          Google e às regras da vitrine.
        </p>
        <ProductSeoLlmPromptHelper />
      </div>

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
            <ProductFormLabelRow
              hint={PRODUCT_FORM_HINTS.metaTitle}
              charCount={{ value: metaTitle, limit: PRODUCT_SEO_TITLE_GOOGLE_LIMIT }}
            >
              <FormLabel>Meta Title (sobrescrita)</FormLabel>
            </ProductFormLabelRow>
            <FormControl>
              <Input
                placeholder="Deixe vazio para usar o título automático"
                maxLength={PRODUCT_META_TITLE_MAX}
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Contador alinhado ao Google (≤ {PRODUCT_SEO_TITLE_GOOGLE_LIMIT} caracteres visíveis).
              Limite técnico do campo: {PRODUCT_META_TITLE_MAX}.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="metaDescription"
        render={({ field }) => (
          <FormItem>
            <ProductFormLabelRow
              hint={PRODUCT_FORM_HINTS.metaDescription}
              charCount={{ value: metaDescription, limit: PRODUCT_SEO_DESCRIPTION_GOOGLE_LIMIT }}
            >
              <FormLabel>Meta Description (sobrescrita)</FormLabel>
            </ProductFormLabelRow>
            <FormControl>
              <Textarea
                rows={4}
                placeholder="Deixe vazio para usar a descrição automática"
                maxLength={PRODUCT_META_DESCRIPTION_MAX}
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Contador alinhado ao Google (≤ {PRODUCT_SEO_DESCRIPTION_GOOGLE_LIMIT} caracteres).
              Limite técnico do campo: {PRODUCT_META_DESCRIPTION_MAX}.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
