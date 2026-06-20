'use client';

import type { Control } from 'react-hook-form';

import type { BlockFormValues } from '@/components/cms/forms/BlockPropsForm';
import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
import { ProductPicker } from '@/components/cms/props-forms/ProductPicker';
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
import type { ProductPickerOption } from '@/lib/api/cms-pages-client';

type FeaturedProductFormProps = {
  control: Control<BlockFormValues>;
  products: ProductPickerOption[];
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function FeaturedProductForm({
  control,
  products,
}: FeaturedProductFormProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <CmsFormSection title="Produto em destaque">
        <FormField
          control={control}
          name="productSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qual produto destacar?</FormLabel>
              <FormControl>
                <ProductPicker
                  products={products}
                  value={readString(field.value)}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Escolha o produto que aparecerá em destaque neste bloco lateral ou hero.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>

      <CmsFormSection title="Aparência" className="cms-form-section-divider">
        <FormField
          control={control}
          name="showMarketplaceBadge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mostrar badge do marketplace</FormLabel>
              <Select
                value={readBoolean(field.value, true) ? 'yes' : 'no'}
                onValueChange={(value) => field.onChange(value === 'yes')}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Sim — exibir Amazon ou Shopee</SelectItem>
                  <SelectItem value="no">Não — ocultar badge</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="ctaLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do botão (opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={readString(field.value)} placeholder="Ex: Ver na Amazon" />
              </FormControl>
              <FormDescription>
                Deixe em branco para usar o texto padrão da vitrine.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CmsFormSection>
    </div>
  );
}
