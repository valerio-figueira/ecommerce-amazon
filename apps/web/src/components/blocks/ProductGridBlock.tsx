'use client';

import { useQuery } from '@tanstack/react-query';

import { productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { ProductCard } from '@/components/product/ProductCard';
import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

export function ProductGridBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = productGridPropsSchema.parse(block.props);
  const { categorySlug } = useCategoryFilter();
  const activeCategory = categorySlug ?? props.categorySlug ?? undefined;

  const queryParams = new URLSearchParams();
  queryParams.set('pageSize', String(props.pageSize));
  if (activeCategory) queryParams.set('category', activeCategory);
  if (props.marketplace) queryParams.set('marketplace', props.marketplace);
  queryParams.set('sort', props.sort);

  const { data, isLoading } = useQuery({
    queryKey: ['products', activeCategory, props.sort, props.pageSize, props.marketplace],
    queryFn: () => apiFetchParsed(`/products?${queryParams.toString()}`, productsPageSchema),
  });

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold md:text-3xl">{props.title}</h2>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: props.pageSize }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-4',
            props.columns === 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2',
          )}
        >
          {data?.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
