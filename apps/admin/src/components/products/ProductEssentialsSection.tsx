'use client';

import { useFormContext } from 'react-hook-form';

import { CategoryCascadeSelect } from '@/components/categories/CategoryCascadeSelect';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { DynamicStringList } from '@/components/products/DynamicStringList';
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
    <>
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

        <FormField
          control={form.control}
          name="titleRaw"
          render={({ field }) => (
            <FormItem>
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.titleRaw}>
                <FormLabel>Título original no marketplace (opcional)</FormLabel>
              </ProductFormLabelRow>
              <FormControl>
                <Input
                  placeholder="Ex: Cadeira Gamer Ergonômica DT3 Rhino Preta com Apoio Lombar..."
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Referência do título bruto do parceiro. Se vazio, o sistema usa o título limpo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <CategoryCascadeSelect options={categoryOptions} />
      </CmsFormSection>

      <CmsFormSection title="Curadoria e avaliações">
        <div className="grid gap-4 sm:grid-cols-3">
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
                    className="w-full"
                    value={field.value}
                    onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Acima de 8,0 → selo &quot;Escolha editorial&quot;.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.rating}>
                  <FormLabel>Nota no marketplace (0 a 5)</FormLabel>
                </ProductFormLabelRow>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                    placeholder="Ex: 4.5"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reviewCount"
            render={({ field }) => (
              <FormItem>
                <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.reviewCount}>
                  <FormLabel>Qtd. de avaliações</FormLabel>
                </ProductFormLabelRow>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full"
                    placeholder="Ex: 128"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.tags}>
                <FormLabel>Tags internas</FormLabel>
              </ProductFormLabelRow>
              <DynamicStringList
                name="tags"
                addLabel="Adicionar tag"
                placeholder="Ex: home-office"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>
    </>
  );
}
