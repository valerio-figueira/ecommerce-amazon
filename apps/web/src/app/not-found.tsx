import { NotFoundContent } from '@/components/errors/NotFoundContent';

export const metadata = {
  title: 'Página não encontrada | Vitrine',
};

export default function NotFoundPage(): React.JSX.Element {
  return <NotFoundContent />;
}
