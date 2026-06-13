'use client';

import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { DynamicStringList } from '@/components/products/DynamicStringList';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/product-form-values';
import { ProductLlmPromptHelper } from '@/components/products/ProductLlmPromptHelper';
import { buildShortDescriptionFromPros } from '@ecommerce-amazon/shared/seo';

export function ProductAnalysisSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const pros = useWatch({ control: form.control, name: 'pros' }) ?? [];
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

  return (
    <CmsFormSection title="Análise editorial">
      <FormField
        control={form.control}
        name="pros"
        render={() => (
          <FormItem>
            <FormLabel>Prós</FormLabel>
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
            <FormLabel>Contras</FormLabel>
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
            <FormLabel>Apresentação rápida</FormLabel>
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
              Texto curto para cards e introdução da página. Se vazio ao salvar, a API monta a partir
              dos prós mais marcantes.
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
              <FormLabel>Análise completa (HTML)</FormLabel>
              <ProductLlmPromptHelper />
            </div>
            <FormControl>
              <Textarea
                rows={14}
                className="font-mono text-xs leading-relaxed"
                placeholder="<h3>Visão geral</h3><p>Escreva a análise detalhada do produto...</p>"
                value={field.value ?? ''}
                onChange={field.onChange}
              />
            </FormControl>
            <FormDescription>
              Review estruturado em HTML (h3, p, strong, table). Preencha manualmente ou use o ícone
              ✨ ao lado para copiar um prompt pronto para IA externa.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
