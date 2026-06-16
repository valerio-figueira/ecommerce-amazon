import { formatAdminPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { notFound } from 'next/navigation';

import { AdminPageCard } from '@/components/admin/AdminPageCard';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { ProductForm } from '@/components/products/ProductForm';
import { getAdminProduct } from '@/lib/api/admin-products';
import { getServerBrandConfig } from '@/lib/brand';
import { adminProductDetailToFormValues } from '@/lib/product-form-values';

type ProductEditPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductEditPageProps) {
  const brand = getServerBrandConfig();
  const { slug } = await params;
  try {
    const product = await getAdminProduct(slug);
    return { title: formatAdminPageTitle(product.titleClean, brand) };
  } catch {
    return { title: formatAdminPageTitle('Editar produto', brand) };
  }
}

export default async function ProductEditPage({
  params,
}: ProductEditPageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getAdminProduct>>;
  try {
    product = await getAdminProduct(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={product.titleClean}
        breadcrumbs={[
          { label: 'Painel', href: '/' },
          { label: 'Produtos', href: '/produtos' },
          { label: product.titleClean },
        ]}
      />
      <AdminPageCard>
        <ProductForm
          mode="edit"
          slug={product.slug}
          productTitle={product.titleClean}
          initialValues={adminProductDetailToFormValues(product)}
        />
      </AdminPageCard>
    </>
  );
}
