'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminMarketplaceLabel } from '@/lib/product-admin-format';
import type { z } from 'zod';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

type ProductFormValues = z.input<typeof createProductBodySchema>;
import { parseMarketplaceProductUrl } from '@ecommerce-amazon/shared/marketplace';

export function ProductLinkSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();
  const [linkDetected, setLinkDetected] = useState(false);

  const handleAffiliateLinkChange = (url: string): void => {
    form.setValue('affiliateLink', url, { shouldDirty: true, shouldValidate: true });

    const parsed = parseMarketplaceProductUrl(url);
    if (parsed) {
      form.setValue('marketplace', parsed.marketplace, { shouldDirty: true });
      form.setValue('externalId', parsed.externalId, { shouldDirty: true });
      setLinkDetected(true);
      return;
    }

    setLinkDetected(false);
  };

  return (
    <CmsFormSection title="1. Link de afiliado">
      <FormField
        control={form.control}
        name="affiliateLink"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cole a URL completa do produto</FormLabel>
            <FormControl>
              <Input
                placeholder="Cole o link da Amazon, Shopee ou Mercado Livre aqui..."
                value={field.value}
                onChange={(event) => handleAffiliateLinkChange(event.target.value)}
              />
            </FormControl>
            <FormDescription>
              O sistema detecta automaticamente o parceiro e o código do produto.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="marketplace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parceiro detectado</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={linkDetected}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o marketplace" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="amazon_br">{adminMarketplaceLabel('amazon_br')}</SelectItem>
                  <SelectItem value="shopee_br">{adminMarketplaceLabel('shopee_br')}</SelectItem>
                  <SelectItem value="mercadolivre_br">
                    {adminMarketplaceLabel('mercadolivre_br')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="externalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID identificado (código do produto)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={linkDetected}
                  placeholder="Detectado automaticamente"
                  className="font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </CmsFormSection>
  );
}
