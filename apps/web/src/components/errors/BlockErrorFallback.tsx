'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BlockErrorFallbackProps = {
  message?: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
};

export function BlockErrorFallback({
  message = 'Não foi possível carregar esta seção.',
  onRetry,
  className,
  compact = false,
}: BlockErrorFallbackProps): React.JSX.Element {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-neutral-200 bg-neutral-50 text-center',
        compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-10',
        className,
      )}
    >
      <AlertCircle
        className={cn('text-neutral-400', compact ? 'h-5 w-5' : 'h-6 w-6')}
        aria-hidden
      />
      <p className={cn('text-neutral-600', compact ? 'text-sm' : 'text-base')}>{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
