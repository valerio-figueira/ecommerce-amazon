'use client';

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { DynamicStringList } from '@/components/products/DynamicStringList';
import { ProductFormLabelRow } from '@/components/products/ProductFormLabelRow';
import { ProductLongDescriptionEditor } from '@/components/products/ProductLongDescriptionEditor';
import { ProductLlmPromptHelper } from '@/components/products/ProductLlmPromptHelper';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/input';
import { FieldHint } from '@/components/ui/field-hint';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';
import { buildShortDescriptionFromPros } from '@ecommerce-amazon/shared/seo';

const LONG_DESCRIPTION_MAX = 50000;

export function ProductAnalysisSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const pros = useWatch({ control: form.control, name: 'pros' }) ?? [];
  const longDescriptionHtml =
    useWatch({ control: form.control, name: 'longDescriptionHtml' }) ?? '';
  const shortDescriptionTouched = useRef(false);

  useEffect(() => {
    if (shortDescriptionTouched.current) {
      return;
    }
    const generated = buildShortDescriptionFromPros(pros);
    if (!generated) {
      return;
    }
    const current = form.getValues('shortDescription')?.trim() ?? '';
    if (current.length === 0) {
      form.setValue('shortDescription', generated, { shouldDirty: false });
    }
  }, [form, pros]);

  const charCount = longDescriptionHtml.length;
  const charCountClass =
    charCount > LONG_DESCRIPTION_MAX
      ? 'text-red-600'
      : charCount > LONG_DESCRIPTION_MAX * 0.9
        ? 'text-amber-700'
        : 'text-[color:var(--admin-text-muted)]';

  return (
    <CmsFormSection title="Análise editorial">
      <FormField
        control={form.control}
        name="pros"
        render={() => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.pros}>
              <FormLabel>Prós</FormLabel>
            </ProductFormLabelRow>
            <DynamicStringList
              name="pros"
              addLabel="Adicionar pró"
              placeholder="Ex: Apoio lombar ajustável"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cons"
        render={() => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.cons}>
              <FormLabel>Contras</FormLabel>
            </ProductFormLabelRow>
            <DynamicStringList
              name="cons"
              addLabel="Adicionar contra"
              placeholder="Ex: Montagem demorada"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.shortDescription}>
              <FormLabel>Apresentação rápida</FormLabel>
            </ProductFormLabelRow>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Gerada automaticamente a partir dos prós. Edite se quiser personalizar."
                value={field.value ?? ''}
                onChange={(event) => {
                  shortDescriptionTouched.current = true;
                  field.onChange(event.target.value);
                }}
              />
            </FormControl>
            <FormDescription>
              Texto curto para cards e introdução da página. Se vazio ao salvar, a API monta a
              partir dos prós mais marcantes.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="longDescriptionHtml"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Análise completa</FormLabel>
              <FieldHint text={PRODUCT_FORM_HINTS.longDescription} />
              <ProductLlmPromptHelper />
            </div>
            <FormControl>
              <ProductLongDescriptionEditor value={field.value ?? ''} onChange={field.onChange} />
            </FormControl>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FormDescription>
                Review estruturado com editor visual ou aba <strong>Código HTML</strong> para colar
                saída da IA (✨). Tags suportadas: h3, p, strong, table, ul, li e links.
              </FormDescription>
              <p className={`text-xs tabular-nums ${charCountClass}`} aria-live="polite">
                {charCount.toLocaleString('pt-BR')} / {LONG_DESCRIPTION_MAX.toLocaleString('pt-BR')}
              </p>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
