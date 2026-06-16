'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';

import type { CategoryPillsProps } from '@ecommerce-amazon/shared/cms';
import {
  findCategoryNodeBySlug,
  getDirectChildren,
  getRootSlugForCategory,
} from '@ecommerce-amazon/shared/category/category-tree-nav';

import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { apiFetchParsed } from '@/lib/api/client';
import { categoriesResponseSchema, type CategoryTreeNodeDto } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

type CategoryPillsRowProps = {
  categorySlugs: CategoryPillsProps['categorySlugs'];
  mode?: CategoryPillsProps['mode'];
  showSubcategories?: CategoryPillsProps['showSubcategories'];
};

function pillClassName(active: boolean): string {
  return cn(
    'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-[var(--primary)] text-white'
      : 'border border-neutral-300 bg-white hover:bg-neutral-50',
  );
}

function subPillClassName(active: boolean): string {
  return cn(
    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'bg-neutral-900 text-white'
      : 'border border-neutral-200 bg-neutral-50 hover:bg-neutral-100',
  );
}

export function CategoryPillsRow({
  categorySlugs,
  mode = 'filter',
  showSubcategories = true,
}: CategoryPillsRowProps): React.JSX.Element {
  const { categorySlug, setCategorySlug } = useCategoryFilter();

  const { data: categories, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await apiFetchParsed('/categories', categoriesResponseSchema);
      return result.items;
    },
  });

  const tree = categories ?? [];

  const rootNodes = useMemo(
    () =>
      categorySlugs
        .map((slug) => findCategoryNodeBySlug(tree, slug))
        .filter((node): node is CategoryTreeNodeDto => node !== null),
    [categorySlugs, tree],
  );

  const activeRootSlug = useMemo(() => {
    if (!categorySlug) return null;
    const root = getRootSlugForCategory(tree, categorySlug);
    if (root && categorySlugs.includes(root)) {
      return root;
    }
    if (categorySlugs.includes(categorySlug)) {
      return categorySlug;
    }
    return null;
  }, [categorySlug, categorySlugs, tree]);

  const activeRootNode = activeRootSlug ? findCategoryNodeBySlug(tree, activeRootSlug) : null;
  const subcategoryNodes =
    showSubcategories && activeRootNode ? getDirectChildren(tree, activeRootNode.slug) : [];

  function handleFilterSelect(slug: string | null) {
    setCategorySlug(slug);
  }

  function renderFilterPill(label: string, slug: string | null, active: boolean, sub = false) {
    return (
      <button
        key={slug ?? '__all__'}
        type="button"
        onClick={() => handleFilterSelect(slug)}
        className={sub ? subPillClassName(active) : pillClassName(active)}
      >
        {label}
      </button>
    );
  }

  function renderLinkPill(label: string, slug: string | null, active: boolean, sub = false) {
    if (!slug) {
      return (
        <Link key="__all__" href="/" className={sub ? subPillClassName(active) : pillClassName(active)}>
          {label}
        </Link>
      );
    }

    return (
      <Link
        key={slug}
        href={`/categorias/${slug}`}
        className={sub ? subPillClassName(active) : pillClassName(active)}
      >
        {label}
      </Link>
    );
  }

  const renderPill = mode === 'link' ? renderLinkPill : renderFilterPill;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {isError && (
        <p className="text-xs text-neutral-500" role="status">
          Categorias indisponíveis no momento.
        </p>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
        {renderPill('Todos', null, categorySlug === null)}
        {rootNodes.map((node) =>
          renderPill(node.label, node.slug, activeRootSlug === node.slug),
        )}
      </div>

      {subcategoryNodes.length > 0 && activeRootNode ? (
        <div className="flex min-h-[2.25rem] gap-2 overflow-x-auto pb-1 md:pb-0">
          {renderPill(
            `Todas de ${activeRootNode.label}`,
            activeRootNode.slug,
            categorySlug === activeRootNode.slug,
            true,
          )}
          {subcategoryNodes.map((child) =>
            renderPill(child.label, child.slug, categorySlug === child.slug, true),
          )}
        </div>
      ) : (
        <div className="min-h-[2.25rem]" aria-hidden />
      )}
    </div>
  );
}
