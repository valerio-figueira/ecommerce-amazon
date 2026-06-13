'use client';

import { useFormContext } from 'react-hook-form';

import { CmsFormSection } from '@/components/cms/props-forms/CmsFormSection';
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
import { defaultProductCanonicalPreview } from '@/lib/site-url';

type ProductSeoSectionProps = {
  slug?: string | undefined;
};

export function ProductSeoSection({ slug }: ProductSeoSectionProps): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const previewSlug = slug ?? 'slug-do-produto';
  const defaultCanonical = defaultProductCanonicalPreview(previewSlug);

  return (
    <CmsFormSection title="SEO">
      <FormField
        control={form.control}
        name="canonicalUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL canônica (opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder={defaultCanonical}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormControl>
            <FormDescription>
              Indica ao Google qual é a URL oficial deste produto, evitando conteúdo duplicado quando
              o mesmo item aparece em coleções, campanhas ou com parâmetros UTM. Se vazio, usamos{' '}
              <span className="font-mono text-xs">{defaultCanonical}</span>.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
