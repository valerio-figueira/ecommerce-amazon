import { ArticleCardSkeleton } from '@/components/loading/ArticleCardSkeleton';
import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleListingSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6" aria-busy="true">
      <LoadingAnnouncer />

      <header className="mb-8" aria-hidden>
        <Skeleton className="h-10 w-48 max-w-xs" />
      </header>

      <div className="space-y-8">
        <div className="space-y-4" aria-hidden>
          <Skeleton className="h-10 w-full max-w-md rounded-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-hidden
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>

        <div className="flex justify-center gap-2" aria-hidden>
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </main>
  );
}
