import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { ProductGridSkeleton } from '@/components/loading/ProductGridSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export function CollectionPageSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-12" aria-busy="true">
      <LoadingAnnouncer />

      <div className="flex gap-2" aria-hidden>
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-36" />
      </div>

      <header className="max-w-3xl space-y-4" aria-hidden>
        <Skeleton className="h-6 w-36 rounded" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </header>

      <hr className="border-neutral-100" aria-hidden />

      <section aria-hidden>
        <ProductGridSkeleton count={8} />
      </section>
    </main>
  );
}
