'use client';

import { useQuery } from '@tanstack/react-query';

import { categoryPillsPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { useCategoryFilter } from '@/components/cms/CategoryFilterContext';
import { apiFetchParsed } from '@/lib/api/client';
import { categoriesResponseSchema } from '@/lib/api/schemas';
import { cn } from '@/lib/utils';

export function CategoryPillsBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = categoryPillsPropsSchema.parse(block.props);
  const { categorySlug, setCategorySlug } = useCategoryFilter();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await apiFetchParsed('/categories', categoriesResponseSchema);
      return result.items;
    },
  });

  const labels = new Map(categories?.map((c) => [c.slug, c.label]) ?? []);

  return (
    <section>
      {props.title && <h2 className="mb-4 text-2xl font-bold md:text-3xl">{props.title}</h2>}
      <div className="flex gap-2 overflow-x-auto pb-2">
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
        {props.categorySlugs.map((slug) => (
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
    </section>
  );
}
