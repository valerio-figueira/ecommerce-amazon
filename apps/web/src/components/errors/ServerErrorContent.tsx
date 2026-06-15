'use client';

import Link from 'next/link';

import { ErrorPageLayout } from '@/components/errors/ErrorPageLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const outlineLinkClassName = cn(
  'inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-6 py-3 text-base font-medium transition-colors hover:bg-neutral-50',
);

type ServerErrorContentProps = {
  onRetry?: () => void;
};

export function ServerErrorContent({ onRetry }: ServerErrorContentProps): React.JSX.Element {
  return (
    <ErrorPageLayout
      statusCode={500}
      title="Algo deu errado"
      description="Não foi possível carregar esta página no momento. Tente novamente em instantes ou volte para a vitrine."
    >
      {onRetry && (
        <Button type="button" variant="primary" size="lg" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
      <Link href="/" className={outlineLinkClassName}>
        Ir para a home
      </Link>
    </ErrorPageLayout>
  );
}
