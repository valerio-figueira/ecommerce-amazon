import { fetchCategoryTree, getCategoryNavItems } from '@/lib/api/categories';

import { SiteHeader } from './SiteHeader';

export async function SiteHeaderShell(): Promise<React.JSX.Element> {
  let navCategories: ReturnType<typeof getCategoryNavItems> = [];

  try {
    const tree = await fetchCategoryTree();
    navCategories = getCategoryNavItems(tree);
  } catch {
    navCategories = [];
  }

  return <SiteHeader navCategories={navCategories} />;
}
