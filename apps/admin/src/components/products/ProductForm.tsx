'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { ProductEditorialSection } from '@/components/products/ProductEditorialSection';
import { ProductLinkSection } from '@/components/products/ProductLinkSection';
import { ProductPriceSection } from '@/components/products/ProductPriceSection';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createAdminProductClient } from '@/lib/api/admin-products-client';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';
import type { z } from 'zod';

type ProductFormValues = z.input<typeof createProductBodySchema>;

const defaultValues: ProductFormValues = {
  affiliateLink: '',
  marketplace: 'amazon_br',
  externalId: '',
  titleClean: '',
  images: [],
  editorialScore: 5,
  pros: [],
  cons: [],
  price: 0,
  shouldShowPrice: false,
  availability: 'in_stock',
};

export function ProductForm(): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductBodySchema),
    defaultValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createAdminProductClient(createProductBodySchema.parse(values));
      adminToast.success('Produto cadastrado no catálogo.');
      router.push('/produtos');
      router.refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Erro ao salvar produto');
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className="space-y-8"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[var(--admin-navy-deep)]">
            Cadastrar produto no catálogo
          </h2>
          <p className="text-sm text-[var(--admin-text-muted)]">
            Insira os dados manualmente. O sistema preparará o rastreamento automaticamente.
          </p>
        </div>

        <div className="space-y-8 rounded-xl border border-[var(--admin-gray)] bg-[var(--admin-accent-subtle)] p-4 sm:p-6">
          <ProductLinkSection />
          <ProductEditorialSection />
          <ProductPriceSection />
        </div>

        <div className="flex justify-end border-t border-[var(--admin-gray)] pt-4">
          <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar produto no catálogo'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
