import { formatWebPageTitle } from '@ecommerce-amazon/shared/config/brand';

import { NotFoundContent } from '@/components/errors/NotFoundContent';
import { getServerBrandConfig } from '@/lib/site-url';

const brand = getServerBrandConfig();

export const metadata = {
  title: formatWebPageTitle('Página não encontrada', brand),
};

export default function NotFoundPage(): React.JSX.Element {
  return <NotFoundContent />;
}
