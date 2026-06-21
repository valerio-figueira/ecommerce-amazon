import { fetchCategoryNavTreeForHeader } from '@/lib/api/categories';
import { getServerBrandConfig } from '@/lib/site-url';

import { SiteHeader } from './SiteHeader';

export async function SiteHeaderShell(): Promise<React.JSX.Element> {
  const navCategories = await fetchCategoryNavTreeForHeader();
  const brand = getServerBrandConfig();

  return <SiteHeader siteName={brand.name} navCategories={navCategories} />;
}
