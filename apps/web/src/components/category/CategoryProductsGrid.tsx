import { Suspense } from 'react';

import { buildCategoryProductItemListJsonLd, parseListingPage } from '@ecommerce-amazon/shared/seo';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';

import { CategoryProductsError } from '@/components/category/CategoryProductsError';
import { ListingPagination } from '@/components/listing/ListingPagination';
import { ProductCard } from '@/components/product/ProductCard';
import { getCategoryProducts } from '@/lib/api/category-products';
import { getCategory } from '@/lib/api/cached-fetchers';
import { totalListingPages } from '@/lib/listing';
import { getSiteBaseUrl } from '@/lib/site-url';

type CategoryProductsGridProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function CategoryProductsGrid({
  params,
  searchParams,
}: CategoryProductsGridProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parseListingPage(sp);

  const [productsResult, category] = await Promise.all([
    getCategoryProducts(slug, page),
    getCategory(slug),
  ]);

  const { items: products, total, pageSize, error: productsError } = productsResult;
  const totalPages = totalListingPages(total, pageSize);
  const siteBaseUrl = getSiteBaseUrl();

  const productItemListJsonLd =
    products.length > 0 && category
      ? buildCategoryProductItemListJsonLd({
          siteBaseUrl,
          categoryLabel: category.label,
          products: products.slice(0, 10).map((product) => ({
            slug: product.slug,
            title: product.title,
          })),
        })
      : null;

  return (
    <section className="mb-12 space-y-8">
      {productItemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productItemListJsonLd) }}
        />
      ) : null}

      {productsError ? (
        <CategoryProductsError />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 min-[550px]:grid-cols-3 min-[550px]:gap-4 min-[830px]:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              clickOrigin="listagem"
              placement={ClickPlacement.CATEGORY_LISTING}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-neutral-500">
          Nenhum produto visível nesta categoria no momento.
        </p>
      )}

      <Suspense fallback={null}>
        <ListingPagination
          page={page}
          totalPages={totalPages}
          ariaLabel="Paginação de produtos da categoria"
        />
      </Suspense>
    </section>
  );
}
