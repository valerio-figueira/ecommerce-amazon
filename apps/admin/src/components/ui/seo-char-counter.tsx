import { cn } from '@/lib/utils';

type SeoCharCounterProps = {
  value: string;
  limit: number;
};

export function SeoCharCounter({ value, limit }: SeoCharCounterProps): React.JSX.Element {
  const length = value.length;
  const isOver = length > limit;

  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap text-xs tabular-nums text-[var(--admin-text-muted)]',
        isOver && 'font-medium text-amber-700',
      )}
      aria-live="polite"
      title={isOver ? 'Pode ser cortado nos resultados do Google' : undefined}
    >
      {length} / {limit}
    </span>
  );
}
