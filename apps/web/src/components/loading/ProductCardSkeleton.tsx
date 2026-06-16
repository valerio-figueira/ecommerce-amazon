import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ProductCardSkeletonProps = {
  variant?: 'default' | 'compact';
};

export function ProductCardSkeleton({
  variant = 'default',
}: ProductCardSkeletonProps): React.JSX.Element {
  const imageAspect = variant === 'compact' ? 'aspect-[4/3]' : 'aspect-[4/5]';

  return (
    <div className="flex h-full flex-col gap-3" aria-hidden>
      <Skeleton className={cn('rounded-2xl', imageAspect)} />
      <Skeleton className="h-3 w-1/3 rounded-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}
