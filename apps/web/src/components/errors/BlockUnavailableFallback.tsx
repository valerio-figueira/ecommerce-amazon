import { cn } from '@/lib/utils';

type BlockUnavailableFallbackProps = {
  message?: string;
  className?: string;
  variant?: 'hero' | 'offer' | 'list' | 'default';
};

const variantClasses: Record<NonNullable<BlockUnavailableFallbackProps['variant']>, string> = {
  hero: 'min-h-[18rem] md:col-span-2 md:row-span-2 md:min-h-[22rem]',
  offer: 'min-h-[10.5rem]',
  list: 'min-h-[10.5rem]',
  default: 'min-h-[8rem]',
};

export function BlockUnavailableFallback({
  message = 'Conteúdo indisponível.',
  className,
  variant = 'default',
}: BlockUnavailableFallbackProps): React.JSX.Element {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-4 text-center text-sm text-neutral-500',
        variantClasses[variant],
        className,
      )}
    >
      {message}
    </div>
  );
}
