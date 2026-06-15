'use client';

import { useRouter } from 'next/navigation';

import { BlockErrorFallback } from '@/components/errors/BlockErrorFallback';

export function CategoryProductsError(): React.JSX.Element {
  const router = useRouter();

  return (
    <BlockErrorFallback
      message="Não foi possível carregar os produtos desta categoria."
      onRetry={() => router.refresh()}
    />
  );
}
