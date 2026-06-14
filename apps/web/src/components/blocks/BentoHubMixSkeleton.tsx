import { cn } from '@/lib/utils';

type BentoHubMixSkeletonProps = {
  variant: 'hero' | 'offer' | 'list';
  className?: string;
};

export function BentoHubMixSkeleton({
  variant,
  className,
}: BentoHubMixSkeletonProps): React.JSX.Element {
  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-3xl border border-gray-100 bg-neutral-100 md:col-span-2 md:row-span-2',
          'min-h-[18rem] md:min-h-[22rem]',
          className,
        )}
        aria-hidden
      />
    );
  }

  if (variant === 'offer') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-3xl border border-gray-100 bg-neutral-100',
          'min-h-[10.5rem]',
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        'animate-pulse rounded-3xl border border-gray-100 bg-neutral-100 p-4',
        'min-h-[10.5rem] space-y-3',
        className,
      )}
      aria-hidden
    >
      <div className="h-4 w-2/3 rounded bg-neutral-200" />
      <div className="h-10 rounded-xl bg-neutral-200" />
      <div className="h-10 rounded-xl bg-neutral-200" />
      <div className="h-10 rounded-xl bg-neutral-200" />
    </div>
  );
}
