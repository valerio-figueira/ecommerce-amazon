'use client';

import { useFormContext } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductFormValues } from '@/lib/product-form-values';
import { PRODUCT_CATEGORY_VERTICALS } from '@ecommerce-amazon/shared/product/category-vertical';

export function ProductEssentialsSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();

  return (
    <CmsFormSection title="Dados essenciais">
      <FormField
        control={form.control}
        name="titleClean"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título limpo do produto</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Cadeira Ergonômica DT3 Rhino" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="categoryVertical"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria</FormLabel>
            <Select
              value={field.value ?? ''}
              onValueChange={(value) => field.onChange(value === '' ? undefined : value)}
            >
              <FormControl>
                <SelectTrigger className="sm:max-w-md">
                  <SelectValue placeholder="Selecione a categoria vertical" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PRODUCT_CATEGORY_VERTICALS.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Usada para filtros da vitrine e contexto editorial. Meta tags SEO são geradas
              automaticamente na publicação.
            </FormDescription>
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
            <FormLabel>Nota editorial (0 a 10)</FormLabel>
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
