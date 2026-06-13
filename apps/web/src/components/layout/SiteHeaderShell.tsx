import { fetchCategoryNavTree } from '@/lib/api/categories';

import { SiteHeader } from './SiteHeader';

export async function SiteHeaderShell(): Promise<React.JSX.Element> {
  const navCategories = await fetchCategoryNavTree();
  return <SiteHeader navCategories={navCategories} />;
}
