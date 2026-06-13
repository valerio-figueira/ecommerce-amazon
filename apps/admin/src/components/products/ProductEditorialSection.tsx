'use client';

import { useFormContext } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { DynamicStringList } from '@/components/products/DynamicStringList';
import { ProductImageList } from '@/components/products/ProductImageList';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ProductFormValues } from '@/lib/product-form-values';

export function ProductEditorialSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();

  return (
    <CmsFormSection title="2. Apresentação na vitrine">
      <FormField
        control={form.control}
        name="titleClean"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome comercial do produto</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Cadeira Ergonômica DT3 Rhino" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem>
            <FormLabel>Imagens do produto</FormLabel>
            <ProductImageList name="images" />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="editorialScore"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nota da nossa equipe (0 a 10)</FormLabel>
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
    </CmsFormSection>
  );
}
