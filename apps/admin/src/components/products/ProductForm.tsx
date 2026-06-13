'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
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
        id="product-create-form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <section className="cms-editor-section">
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="cms-panel-head">
              <h2 className="cms-panel-title">Cadastro manual</h2>
              <p className="cms-panel-meta">
                <strong>Cadastrar produto no catálogo</strong>
                <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                  Insira os dados manualmente. O sistema detecta marketplace e código a partir do
                  link de afiliado e prepara o rastreamento automaticamente.
                </span>
              </p>
            </div>

            <div className="cms-panel-actions">
              <p className="mr-auto text-xs text-[var(--admin-text-muted)]">
                Campos obrigatórios: link, título e marketplace identificado.
              </p>
              <Button type="submit" variant="primary" size="sm" disabled={form.formState.isSubmitting}>
                <Save className="h-4 w-4" />
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar produto no catálogo'}
              </Button>
            </div>
          </div>

          <div className="cms-float-panel cms-blocks-panel">
            <p className="cms-blocks-panel__meta">
              Dados do produto · <strong>3 seções</strong>
            </p>

            <div className="space-y-8">
              <ProductLinkSection />
              <ProductEditorialSection />
              <ProductPriceSection />
            </div>
          </div>
        </section>
      </form>
    </Form>
  );
}
