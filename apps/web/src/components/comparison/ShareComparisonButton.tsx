'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { createComparison } from '@/lib/api/comparisons';
import { getOrCreateSessionId } from '@/lib/session';

type ShareComparisonButtonProps = {
  productIds: string[];
  products: Array<{
    title: string;
    marketplace: string;
    editorialScore: number;
  }>;
  categoryLabel?: string | undefined;
};

export function ShareComparisonButton({
  productIds,
  products,
  categoryLabel,
}: ShareComparisonButtonProps): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createComparison({
        productIds,
        products,
        categoryLabel,
        sessionId: getOrCreateSessionId(),
      });
      router.push(`/comparar/${result.shareToken}`);
    } catch {
      setError('Não foi possível gerar o link. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" disabled={loading} onClick={() => void handleShare()}>
        {loading ? 'Gerando link...' : 'Gerar link compartilhável'}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
