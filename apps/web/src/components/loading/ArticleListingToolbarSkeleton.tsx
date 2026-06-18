import { Skeleton } from '@/components/ui/skeleton';

export function ArticleListingToolbarSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-neutral-200 bg-white p-4 md:p-5" aria-hidden>
      <Skeleton className="h-11 w-full rounded-full" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28 rounded-full" />
        ))}
      </div>
    </div>
  );
}
