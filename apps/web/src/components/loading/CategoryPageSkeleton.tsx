import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { ProductGridSkeleton } from '@/components/loading/ProductGridSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoryPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8" aria-busy="true">
      <LoadingAnnouncer />

      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="mb-8 hidden lg:block" aria-hidden>
          <Skeleton className="mb-3 h-3 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex gap-2" aria-hidden>
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>

          <header className="mb-8 space-y-2" aria-hidden>
            <Skeleton className="h-10 w-2/3 max-w-md" />
            <Skeleton className="h-4 w-32" />
          </header>

          <ProductGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}
