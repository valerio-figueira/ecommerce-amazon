'use client';

import { categoryPillsPropsSchema } from '@ecommerce-amazon/shared/cms';

import type { BlockComponentProps } from '@/components/cms/BlockRegistry';
import { CategoryPillsRow } from '@/components/blocks/CategoryPillsRow';

export function CategoryPillsBlock({ block }: BlockComponentProps): React.JSX.Element {
  const props = categoryPillsPropsSchema.parse(block.props);

  return (
    <section>
      {props.title && (
        <h2 className="mb-4 text-2xl font-bold md:text-3xl">{props.title}</h2>
      )}
      <CategoryPillsRow
        categorySlugs={props.categorySlugs}
        mode={props.mode}
        showSubcategories={props.showSubcategories}
      />
    </section>
  );
}
