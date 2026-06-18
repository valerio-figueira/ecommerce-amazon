'use client';

import { useFormContext } from 'react-hook-form';

import { CategoryCascadeSelect } from '@/components/categories/CategoryCascadeSelect';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { ProductFormLabelRow } from '@/components/products/ProductFormLabelRow';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAdminCategoryOptions } from '@/hooks/useAdminCategoryOptions';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';

export function ProductEssentialsSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const categoryOptions = useAdminCategoryOptions();

  return (
    <CmsFormSection title="Dados essenciais">
      <FormField
        control={form.control}
        name="titleClean"
        render={({ field }) => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.titleClean}>
              <FormLabel>Título limpo do produto</FormLabel>
            </ProductFormLabelRow>
            <FormControl>
              <Input placeholder="Ex: Cadeira Ergonômica DT3 Rhino" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <CategoryCascadeSelect options={categoryOptions} />

      <FormField
        control={form.control}
        name="editorialScore"
        render={({ field }) => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.editorialScore}>
              <FormLabel>Nota editorial (0 a 10)</FormLabel>
            </ProductFormLabelRow>
            <FormControl>
              <Input
                type="number"
                min={0}
                max={10}
                step={0.1}
                className="w-28"
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value) || 0)}
              />
            </FormControl>
            <FormDescription>
              Notas acima de 8,0 adicionam automaticamente o selo &quot;Escolha editorial&quot;.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
