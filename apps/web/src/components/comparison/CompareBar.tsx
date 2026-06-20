'use client';

import { RemoteImage } from '@/components/ui/RemoteImage';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import { useComparison } from '@/components/comparison/ComparisonProvider';
import { Button } from '@/components/ui/button';

export function CompareBar(): React.JSX.Element | null {
  const router = useRouter();
  const { items, isHydrated, count, activeCategoryLabel, clear } = useComparison();

  if (!isHydrated || count < 1) return null;

  const canCompare = count >= 2;
  const slugs = items.map((item) => item.slug).join(',');

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex -space-x-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-neutral-100"
              >
                {item.imageUrl ? (
                  <RemoteImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">Comparar ({count}/3)</p>
            {activeCategoryLabel ? (
              <p className="truncate text-xs text-neutral-500">Categoria: {activeCategoryLabel}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={clear}>
            Limpar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canCompare}
            onClick={() => router.push(`/comparar?p=${encodeURIComponent(slugs)}`)}
          >
            Comparar agora
          </Button>
          <button
            type="button"
            aria-label="Fechar barra de comparação"
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 sm:hidden"
            onClick={clear}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
