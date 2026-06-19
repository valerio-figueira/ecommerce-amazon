'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ProductAdvancedSeoSection } from '@/components/products/ProductAdvancedSeoSection';
import { ProductAnalysisSection } from '@/components/products/ProductAnalysisSection';
import { ProductEssentialsSection } from '@/components/products/ProductEssentialsSection';
import { ProductImagesSection } from '@/components/products/ProductImagesSection';
import { ProductLinkSection } from '@/components/products/ProductLinkSection';
import { ProductPriceSection } from '@/components/products/ProductPriceSection';
import { ProductSpecsForm } from '@/components/products/ProductSpecsForm';
import { ProductThumbnail } from '@/components/products/ProductThumbnail';
import { useAdminToast } from '@/components/ui/admin-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createAdminProductClient,
  updateAdminProductClient,
} from '@/lib/api/admin-products-client';
import type { ProductFormValues } from '@/lib/product-form-values';
import { getPrimaryImageUrl } from '@/lib/product-image';
import { createProductBodySchema } from '@ecommerce-amazon/shared/admin';

const emptyValues: ProductFormValues = {
  affiliateLink: '',
  marketplace: 'amazon_br',
  externalId: '',
  titleClean: '',
  images: [],
  editorialScore: 5,
  pros: [],
  cons: [],
  shortDescription: '',
  longDescriptionHtml: '',
  metaTitle: '',
  metaDescription: '',
  specsNormalized: [],
  price: 0,
  shouldShowPrice: false,
  visible: true,
  availability: 'in_stock',
};

type ProductFormProps = {
  mode: 'create' | 'edit';
  slug?: string;
  initialValues?: ProductFormValues;
  productTitle?: string;
};

export function ProductForm({
  mode,
  slug,
  initialValues,
  productTitle,
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const adminToast = useAdminToast();
  const isEdit = mode === 'edit';
  const [activeTab, setActiveTab] = useState('essentials');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductBodySchema),
    defaultValues: initialValues ?? emptyValues,
  });

  const specsSyncRef = useRef<(() => void) | null>(null);

  const onSubmit = form.handleSubmit(async () => {
    try {
      specsSyncRef.current?.();
      const parsed = createProductBodySchema.parse(form.getValues());
      if (isEdit) {
        if (!slug) {
          throw new Error('Slug do produto não informado');
        }
        await updateAdminProductClient(slug, parsed);
        adminToast.success('Produto atualizado no catálogo.');
      } else {
        await createAdminProductClient(parsed);
        adminToast.success('Produto cadastrado no catálogo.');
      }
      router.push('/produtos');
      router.refresh();
    } catch (error) {
      adminToast.error(error instanceof Error ? error.message : 'Erro ao salvar produto');
    }
  });

  const formId = isEdit ? 'product-edit-form' : 'product-create-form';
  const watchedImages = form.watch('images');
  const watchedTitle = form.watch('titleClean');
  const primaryImage = getPrimaryImageUrl(watchedImages ?? []);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <section className="cms-editor-section">
          <div className="cms-float-panel cms-vitrine-panel">
            <div className="flex gap-4">
              <ProductThumbnail
                key={primaryImage ?? 'no-image'}
                src={primaryImage}
                alt={watchedTitle || productTitle || 'Produto'}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="cms-panel-head">
                  <h2 className="cms-panel-title">{isEdit ? 'Edição manual' : 'Cadastro manual'}</h2>
                  <p className="cms-panel-meta">
                    <strong>{isEdit ? 'Editar produto no catálogo' : 'Cadastrar produto no catálogo'}</strong>
                    {isEdit && productTitle ? (
                      <span className="cms-panel-slug">/{slug}</span>
                    ) : null}
                    <span className="mt-1 block text-xs font-normal text-[var(--admin-text-muted)]">
                      {isEdit
                        ? 'Atualize título, imagens, preço e conteúdo editorial. O slug permanece o mesmo para não quebrar links.'
                        : 'Insira os dados manualmente. Meta tags SEO são geradas automaticamente na vitrine.'}
                    </span>
                  </p>
                </div>

                <div className="cms-panel-actions">
                  <p className="mr-auto text-xs text-[var(--admin-text-muted)]">
                    {isEdit
                      ? `Editando: ${productTitle ?? slug}`
                      : 'Campos obrigatórios: link, título e marketplace identificado.'}
                  </p>
                  <Button type="submit" variant="primary" size="sm" disabled={form.formState.isSubmitting}>
                    <Save className="h-4 w-4" />
                    {form.formState.isSubmitting
                      ? 'Salvando…'
                      : isEdit
                        ? 'Salvar alterações'
                        : 'Salvar produto no catálogo'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="cms-float-panel cms-blocks-panel">
            <p className="cms-blocks-panel__meta">
              Dados do produto · <strong>5 abas</strong>
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="essentials">Link &amp; Essenciais</TabsTrigger>
                <TabsTrigger value="analysis">Análise Editorial</TabsTrigger>
                <TabsTrigger value="specs">Especificações</TabsTrigger>
                <TabsTrigger value="images">Imagens</TabsTrigger>
                <TabsTrigger value="seo">SEO Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="essentials">
                <ProductLinkSection lockIdentity={isEdit} />
                <ProductEssentialsSection />
                <ProductPriceSection />
              </TabsContent>

              <TabsContent value="analysis">
                <ProductAnalysisSection />
              </TabsContent>

              <TabsContent value="specs">
                <ProductSpecsForm onRegisterSync={(sync) => { specsSyncRef.current = sync; }} />
              </TabsContent>

              <TabsContent value="images">
                <ProductImagesSection />
              </TabsContent>

              <TabsContent value="seo">
                <ProductAdvancedSeoSection />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </form>
    </Form>
  );
}
