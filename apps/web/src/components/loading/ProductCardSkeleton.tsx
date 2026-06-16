import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="aspect-[4/5] rounded-2xl" />
      <Skeleton className="h-3 w-1/3 rounded-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  );
}
