import { Skeleton } from '@/components/ui/skeleton';

export function CategoryHeaderSkeleton(): React.JSX.Element {
  return (
    <div aria-hidden>
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>

      <header className="mb-8 space-y-2">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-32" />
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-full" />
        ))}
      </div>
    </div>
  );
}
