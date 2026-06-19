'use client';

import { useFormContext } from 'react-hook-form';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PRODUCT_FORM_HINTS } from '@/lib/product-form-hints';
import type { ProductFormValues } from '@/lib/product-form-values';

export function ProductPriceSection(): React.JSX.Element {
  const form = useFormContext<ProductFormValues>();

  return (
    <CmsFormSection title="Preço e disponibilidade">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="strikethroughPrice"
          render={({ field }) => (
            <FormItem>
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.strikethroughPrice}>
                <FormLabel>Preço de tabela / riscado (opcional)</FormLabel>
              </ProductFormLabelRow>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="De: R$"
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
          name="price"
          render={({ field }) => (
            <FormItem>
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.price}>
                <FormLabel>Preço de venda atual</FormLabel>
              </ProductFormLabelRow>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Por: R$"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="shouldShowPrice"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] p-4">
            <div className="space-y-1">
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.shouldShowPrice}>
                <FormLabel className="normal-case tracking-normal">
                  Exibir valor numérico na vitrine?
                </FormLabel>
              </ProductFormLabelRow>
              <FormDescription>
                Ative apenas se você tiver certeza de que este preço mudará pouco. Se desativar, o
                site exibirá automaticamente o botão &quot;Consultar preço atualizado&quot;, o que
                protege seu site de exibir preços errados e aumenta seus cliques de afiliado.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] p-4">
            <div className="space-y-1">
              <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.visible}>
                <FormLabel className="normal-case tracking-normal">Exibir na home?</FormLabel>
              </ProductFormLabelRow>
              <FormDescription>
                Quando desativado, o produto deixa de aparecer nos blocos da home (grids e destaque).
                Continua visível no painel admin e acessível pela página de detalhe.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <ProductFormLabelRow hint={PRODUCT_FORM_HINTS.availability}>
              <FormLabel>Disponibilidade</FormLabel>
            </ProductFormLabelRow>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="in_stock">Em estoque</SelectItem>
                <SelectItem value="out_of_stock">Fora de estoque</SelectItem>
                <SelectItem value="unknown">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </CmsFormSection>
  );
}
