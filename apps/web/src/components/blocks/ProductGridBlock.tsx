'use client';

import { useQuery } from '@tanstack/react-query';

import { BlockType } from '@ecommerce-amazon/domain';
import { categoryPillsPropsSchema, productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { CategoryPillsRow } from '@/components/blocks/CategoryPillsRow';
import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { ProductCard } from '@/components/product/ProductCard';
import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

function findLinkedPillsBlock(
  blocksById: Record<string, BlockComponentProps['block']>,
  gridBlockId: string,
): BlockComponentProps['block'] | undefined {
  for (const candidate of Object.values(blocksById)) {
    if (candidate.type !== BlockType.CATEGORY_PILLS) continue;
    const pillsProps = categoryPillsPropsSchema.parse(candidate.props);
    if (pillsProps.linkedBlockId === gridBlockId) return candidate;
  }
  return undefined;
}

export function ProductGridBlock({
  block,
  blocksById,
}: BlockComponentProps): React.JSX.Element {
  const props = productGridPropsSchema.parse(block.props);
  const { categorySlug } = useCategoryFilter();
  const activeCategory = categorySlug ?? props.categorySlug ?? undefined;

  const linkedPills = findLinkedPillsBlock(blocksById, block.id);
  const linkedPillsProps = linkedPills
    ? categoryPillsPropsSchema.parse(linkedPills.props)
    : undefined;

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
      <div
        className={cn(
          'mb-6 flex flex-col gap-4',
          linkedPillsProps && 'md:flex-row md:items-center md:justify-between',
        )}
      >
        <h2 className="shrink-0 text-2xl font-bold md:text-3xl">{props.title}</h2>
        {linkedPillsProps && <CategoryPillsRow categorySlugs={linkedPillsProps.categorySlugs} />}
      </div>
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
            <ProductCard key={product.id} product={product} blockId={block.id} />
          ))}
        </div>
      )}
    </section>
  );
}
