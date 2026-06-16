import { LoadingAnnouncer } from '@/components/loading/LoadingAnnouncer';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8" aria-busy="true">
      <LoadingAnnouncer />

      <div className="mb-6 flex gap-2" aria-hidden>
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-8 md:grid-cols-2" aria-hidden>
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="flex flex-col justify-center gap-5">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      <div className="mt-8 space-y-4" aria-hidden>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <div className="mt-8 space-y-3" aria-hidden>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </main>
  );
}
