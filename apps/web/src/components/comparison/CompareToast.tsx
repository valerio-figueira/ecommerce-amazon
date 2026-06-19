'use client';

import { useComparison } from '@/components/comparison/ComparisonProvider';
import { cn } from '@/lib/utils';

export function CompareToast(): React.JSX.Element | null {
  const { toast, dismissToast } = useComparison();
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4">
      <div
        role="status"
        className={cn(
          'pointer-events-auto max-w-md rounded-[var(--radius)] border px-4 py-3 text-sm shadow-lg',
          toast.variant === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-950'
            : 'border-neutral-200 bg-white text-neutral-800',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <p>{toast.text}</p>
          <button
            type="button"
            className="shrink-0 text-xs font-medium underline"
            onClick={dismissToast}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
