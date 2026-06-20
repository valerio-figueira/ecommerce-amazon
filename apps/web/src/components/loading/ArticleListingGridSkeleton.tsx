import { ArticleCardSkeleton } from '@/components/loading/ArticleCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleListingGridSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex justify-center gap-2">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}
