import { getCachedCategoryTree } from '@/lib/api/categories';

import { CategorySidebarTree } from './CategorySidebarTree';

type CategorySidebarProps = {
  params: Promise<{ slug: string }>;
};

export async function CategorySidebar({
  params,
}: CategorySidebarProps): Promise<React.JSX.Element | null> {
  const { slug } = await params;
  const categoryTree = await getCachedCategoryTree().catch(() => []);

  if (categoryTree.length === 0) {
    return null;
  }

  return (
    <aside className="mb-8 hidden lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Navegar</p>
      <CategorySidebarTree nodes={categoryTree} activeSlug={slug} />
    </aside>
  );
}
