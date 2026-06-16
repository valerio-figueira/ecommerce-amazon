import { buildNotFoundMetadata } from '@ecommerce-amazon/shared/seo';

import { NotFoundContent } from '@/components/errors/NotFoundContent';

export const metadata = buildNotFoundMetadata('Página não encontrada');

export default function NotFoundPage(): React.JSX.Element {
  return <NotFoundContent />;
}
