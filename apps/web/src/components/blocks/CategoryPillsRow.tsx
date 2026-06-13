'use client';

import { useQuery } from '@tanstack/react-query';

import type { CategoryPillsProps } from '@ecommerce-amazon/shared/cms';

import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { apiFetchParsed } from '@/lib/api/client';
import { categoriesResponseSchema, type CategoryTreeNodeDto } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

function flattenCategoryLabels(items: CategoryTreeNodeDto[]): Array<{ slug: string; label: string }> {
  return items.flatMap((item) => [
    { slug: item.slug, label: item.label },
    ...(item.subcategories ? flattenCategoryLabels(item.subcategories) : []),
  ]);
}

type CategoryPillsRowProps = {
  categorySlugs: CategoryPillsProps['categorySlugs'];
};

export function CategoryPillsRow({ categorySlugs }: CategoryPillsRowProps): React.JSX.Element {
  const { categorySlug, setCategorySlug } = useCategoryFilter();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await apiFetchParsed('/categories', categoriesResponseSchema);
      return result.items;
    },
  });

  const labels = new Map(flattenCategoryLabels(categories ?? []).map((c) => [c.slug, c.label]));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
      <button
        type="button"
        onClick={() => setCategorySlug(null)}
        className={cn(
          'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          categorySlug === null
            ? 'bg-[var(--primary)] text-white'
            : 'border border-neutral-300 bg-white hover:bg-neutral-50',
        )}
      >
        Todos
      </button>
      {categorySlugs.map((slug) => (
        <button
          key={slug}
          type="button"
          onClick={() => setCategorySlug(slug)}
          className={cn(
            'shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            categorySlug === slug
              ? 'bg-[var(--primary)] text-white'
              : 'border border-neutral-300 bg-white hover:bg-neutral-50',
          )}
        >
          {labels.get(slug) ?? slug}
        </button>
      ))}
    </div>
  );
}
