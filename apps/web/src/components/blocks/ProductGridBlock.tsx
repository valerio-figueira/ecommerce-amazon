'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';

import { BlockType } from '@ecommerce-amazon/domain';
import { ClickPlacement } from '@ecommerce-amazon/shared/analytics';
import { categoryPillsPropsSchema, productGridPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { BlockErrorFallback } from '@/components/errors/BlockErrorFallback';
import { CategoryPillsRow } from '@/components/blocks/CategoryPillsRow';
import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { ProductCarousel } from '@/components/product/ProductCarousel';
import { apiFetchParsed } from '@/lib/api/client';
import { productsPageSchema, type ProductsPageDto } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

const DEFAULT_CATALOG_SLUG = 'home-office';

type ProductGridBlockProps = BlockComponentProps & {
  initialProducts?: ProductsPageDto;
};

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

function resolveCatalogHref(
  catalogHref: string | undefined,
  activeCategory: string | undefined,
): string {
  if (catalogHref) {
    return catalogHref;
  }

  if (activeCategory) {
    return `/categorias/${activeCategory}`;
  }

  return `/categorias/${DEFAULT_CATALOG_SLUG}`;
}

export function ProductGridBlock({
  block,
  blocksById,
  initialProducts,
}: ProductGridBlockProps): React.JSX.Element {
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
  queryParams.set('visibleOnly', 'true');

  const isDefaultQuery =
    activeCategory === (props.categorySlug ?? undefined) &&
    !categorySlug;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', activeCategory, props.sort, props.pageSize, props.marketplace, 'home-visible'],
    queryFn: () => apiFetchParsed(`/products?${queryParams.toString()}`, productsPageSchema),
    initialData: isDefaultQuery ? initialProducts : undefined,
    staleTime: isDefaultQuery && initialProducts ? 60_000 : 0,
  });

  const catalogHref = useMemo(
    () => resolveCatalogHref(props.catalogHref, activeCategory),
    [props.catalogHref, activeCategory],
  );

  return (
    <section>
      <div
        className={cn(
          'mb-6 flex flex-col gap-4',
          linkedPillsProps && 'md:flex-row md:items-start md:justify-between',
        )}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-2xl font-bold md:text-3xl">{props.title}</h2>
          <Link
            href={catalogHref}
            className="inline-flex text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
          >
            {props.catalogCtaLabel}
          </Link>
        </div>
        {linkedPillsProps && (
          <CategoryPillsRow
            categorySlugs={linkedPillsProps.categorySlugs}
            mode={linkedPillsProps.mode}
            showSubcategories={linkedPillsProps.showSubcategories}
          />
        )}
      </div>

      {isError ? (
        <BlockErrorFallback
          message="Não foi possível carregar os produtos."
          onRetry={() => void refetch()}
        />
      ) : (
        <ProductCarousel
          products={data?.items ?? []}
          blockId={block.id}
          placement={ClickPlacement.CMS_PRODUCT_GRID}
          isLoading={isLoading}
          skeletonCount={props.pageSize}
          cardVariant="compact"
          slideSize="sm"
        />
      )}
    </section>
  );
}
