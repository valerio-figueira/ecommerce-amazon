import Link from 'next/link';

import { ErrorPageLayout } from '@/components/errors/ErrorPageLayout';
import { cn } from '@/lib/utils';

const primaryLinkClassName = cn(
  'inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-colors hover:opacity-90',
);

const outlineLinkClassName = cn(
  'inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-base font-medium transition-colors hover:bg-neutral-50',
);

export function NotFoundContent(): React.JSX.Element {
  return (
    <ErrorPageLayout
      statusCode={404}
      title="Página não encontrada"
      description="O conteúdo que você procura não existe ou foi removido. Volte para a vitrine ou explore as categorias."
    >
      <Link href="/" className={primaryLinkClassName}>
        Ir para a home
      </Link>
      <Link href="/categorias/home-office" className={outlineLinkClassName}>
        Explorar categorias
      </Link>
    </ErrorPageLayout>
  );
}
